#pragma once

#include <atomic>
#include <array>
#include <cassert>
#include <cstddef>
#include <cstdint>
#include <functional>
#include <iostream>
#include <memory>
#include <new>
#include <thread>
#include <type_traits>
#include <vector>

template <typename T, std::size_t BlockSize = 4096>
class MemoryPool {
public:
    static_assert(sizeof(T) >= sizeof(void*), "Object size must be at least pointer size");
    static_assert(BlockSize > 0, "Block size must be greater than zero");

    MemoryPool() : freeList(nullptr), blockCount(0), allocCount(0), recycleCount(0) {
        expandPool();
    }

    ~MemoryPool() {
        for (auto* block : blocks) {
            ::operator delete(block, std::align_val_t{alignof(T)});
        }
    }

    MemoryPool(const MemoryPool&) = delete;
    MemoryPool& operator=(const MemoryPool&) = delete;

    MemoryPool(MemoryPool&& other) noexcept
        : freeList(other.freeList.load(std::memory_order_relaxed))
        , blocks(std::move(other.blocks))
        , blockCount(other.blockCount.load(std::memory_order_relaxed))
        , allocCount(other.allocCount.load(std::memory_order_relaxed))
        , recycleCount(other.recycleCount.load(std::memory_order_relaxed)) {
        other.freeList.store(nullptr, std::memory_order_relaxed);
        other.blockCount.store(0, std::memory_order_relaxed);
    }

    template <typename... Args>
    T* allocate(Args&&... args) {
        void* slot = popFreeSlot();

        if (!slot) {
            expandPool();
            slot = popFreeSlot();
            assert(slot && "Pool expansion failed to produce free slots");
        }

        allocCount.fetch_add(1, std::memory_order_relaxed);
        return new (slot) T(std::forward<Args>(args)...);
    }

    void deallocate(T* obj) {
        if (!obj) return;

        obj->~T();
        pushFreeSlot(obj);
        recycleCount.fetch_add(1, std::memory_order_relaxed);
    }

    std::size_t getAllocCount() const { return allocCount.load(std::memory_order_relaxed); }
    std::size_t getRecycleCount() const { return recycleCount.load(std::memory_order_relaxed); }
    std::size_t getActiveCount() const { return getAllocCount() - getRecycleCount(); }
    std::size_t getBlockCount() const { return blockCount.load(std::memory_order_relaxed); }
    std::size_t getCapacity() const { return getBlockCount() * BlockSize; }

private:
    struct FreeNode {
        FreeNode* next;
    };

    std::atomic<FreeNode*> freeList;
    std::vector<void*> blocks;
    std::atomic<std::size_t> blockCount;
    std::atomic<std::size_t> allocCount;
    std::atomic<std::size_t> recycleCount;

    void expandPool() {
        std::size_t slotSize = sizeof(T) < sizeof(FreeNode) ? sizeof(FreeNode) : sizeof(T);
        void* block = ::operator new(slotSize * BlockSize, std::align_val_t{alignof(T)});
        blocks.push_back(block);
        blockCount.fetch_add(1, std::memory_order_relaxed);

        char* raw = static_cast<char*>(block);
        for (std::size_t i = 0; i < BlockSize; ++i) {
            pushFreeSlot(raw + i * slotSize);
        }
    }

    void* popFreeSlot() {
        FreeNode* head = freeList.load(std::memory_order_acquire);

        while (head) {
            if (freeList.compare_exchange_weak(head, head->next,
                std::memory_order_acq_rel, std::memory_order_acquire)) {
                return static_cast<void*>(head);
            }
        }

        return nullptr;
    }

    void pushFreeSlot(void* slot) {
        FreeNode* node = static_cast<FreeNode*>(slot);
        node->next = freeList.load(std::memory_order_relaxed);

        while (!freeList.compare_exchange_weak(node->next, node,
            std::memory_order_release, std::memory_order_relaxed)) {
        }
    }
};

template <typename T, std::size_t BlockSize = 4096>
class PoolHandle {
public:
    using Pool = MemoryPool<T, BlockSize>;

    PoolHandle() : ptr(nullptr), owner(nullptr) {}

    PoolHandle(T* p, Pool* pool) : ptr(p), owner(pool) {}

    ~PoolHandle() { release(); }

    PoolHandle(const PoolHandle&) = delete;
    PoolHandle& operator=(const PoolHandle&) = delete;

    PoolHandle(PoolHandle&& other) noexcept : ptr(other.ptr), owner(other.owner) {
        other.ptr = nullptr;
        other.owner = nullptr;
    }

    PoolHandle& operator=(PoolHandle&& other) noexcept {
        if (this != &other) {
            release();
            ptr = other.ptr;
            owner = other.owner;
            other.ptr = nullptr;
            other.owner = nullptr;
        }
        return *this;
    }

    T* get() const { return ptr; }
    T& operator*() const { return *ptr; }
    T* operator->() const { return ptr; }
    explicit operator bool() const { return ptr != nullptr; }

    void release() {
        if (ptr && owner) {
            owner->deallocate(ptr);
            ptr = nullptr;
        }
    }

    T* detach() {
        T* temp = ptr;
        ptr = nullptr;
        return temp;
    }

private:
    T* ptr;
    Pool* owner;
};

template <typename T, std::size_t BlockSize = 4096>
class ObjectRecycler {
public:
    using Pool = MemoryPool<T, BlockSize>;
    using Handle = PoolHandle<T, BlockSize>;
    using ResetFn = std::function<void(T&)>;

    explicit ObjectRecycler(ResetFn resetFunc = nullptr)
        : resetFunction(std::move(resetFunc)) {}

    template <typename... Args>
    Handle acquire(Args&&... args) {
        return Handle(pool.allocate(std::forward<Args>(args)...), &pool);
    }

    void recycle(Handle& handle) {
        if (handle && resetFunction) {
            resetFunction(*handle);
        }
        handle.release();
    }

    const Pool& getPool() const { return pool; }

    void printStats() const {
        std::cout << "pool stats"
                  << " | capacity: " << pool.getCapacity()
                  << " | blocks: " << pool.getBlockCount()
                  << " | allocated: " << pool.getAllocCount()
                  << " | recycled: " << pool.getRecycleCount()
                  << " | active: " << pool.getActiveCount()
                  << "\n";
    }

private:
    Pool pool;
    ResetFn resetFunction;
};

struct Particle {
    float x, y, z;
    float vx, vy, vz;
    float lifetime;
    bool active;

    Particle() : x(0), y(0), z(0), vx(0), vy(0), vz(0), lifetime(0), active(false) {}

    Particle(float px, float py, float pz, float lt)
        : x(px), y(py), z(pz), vx(0), vy(0), vz(0), lifetime(lt), active(true) {}

    void update(float dt) {
        if (!active) return;

        x += vx * dt;
        y += vy * dt;
        z += vz * dt;
        lifetime -= dt;

        if (lifetime <= 0.0f) {
            active = false;
        }
    }
};

class ParticleSystem {
public:
    ParticleSystem()
        : recycler([](Particle& p) {
            p.x = 0; p.y = 0; p.z = 0;
            p.vx = 0; p.vy = 0; p.vz = 0;
            p.lifetime = 0;
            p.active = false;
        }) {}

    void emit(float x, float y, float z, float lifetime) {
        auto handle = recycler.acquire(x, y, z, lifetime);
        handle->vx = static_cast<float>((rand() % 200 - 100)) / 100.0f;
        handle->vy = static_cast<float>((rand() % 200 - 100)) / 100.0f;
        handle->vz = static_cast<float>((rand() % 200 - 100)) / 100.0f;
        particles.push_back(std::move(handle));
    }

    void update(float dt) {
        for (auto it = particles.begin(); it != particles.end();) {
            (*it)->update(dt);

            if (!(*it)->active) {
                recycler.recycle(*it);
                it = particles.erase(it);
            } else {
                ++it;
            }
        }
    }

    std::size_t getActiveCount() const { return particles.size(); }

    void printStats() const {
        std::cout << "active particles: " << particles.size() << "\n";
        recycler.printStats();
    }

private:
    using Handle = PoolHandle<Particle, 4096>;
    ObjectRecycler<Particle, 4096> recycler;
    std::vector<Handle> particles;
};

template <typename Func>
double benchmark(const std::string& label, std::size_t iterations, Func&& fn) {
    auto start = std::chrono::high_resolution_clock::now();

    for (std::size_t i = 0; i < iterations; ++i) {
        fn();
    }

    auto end = std::chrono::high_resolution_clock::now();
    double ms = std::chrono::duration<double, std::milli>(end - start).count();
    std::cout << label << ": " << ms << "ms (" << iterations << " iterations)\n";
    return ms;
}

void runConcurrencyTest() {
    MemoryPool<Particle, 1024> pool;
    constexpr int threadCount = 8;
    constexpr int opsPerThread = 10000;
    std::vector<std::thread> threads;

    auto worker = [&pool](int id) {
        std::vector<Particle*> local;
        local.reserve(opsPerThread);

        for (int i = 0; i < opsPerThread; ++i) {
            Particle* p = pool.allocate(
                static_cast<float>(i),
                static_cast<float>(id),
                0.0f,
                5.0f
            );
            local.push_back(p);
        }

        for (Particle* p : local) {
            pool.deallocate(p);
        }
    };

    auto start = std::chrono::high_resolution_clock::now();

    for (int i = 0; i < threadCount; ++i) {
        threads.emplace_back(worker, i);
    }

    for (auto& t : threads) {
        t.join();
    }

    auto end = std::chrono::high_resolution_clock::now();
    double ms = std::chrono::duration<double, std::milli>(end - start).count();

    std::cout << "concurrency test: " << threadCount << " threads x " << opsPerThread
              << " ops each completed in " << ms << "ms\n";
    std::cout << "total ops: " << pool.getAllocCount() << " alloc | "
              << pool.getRecycleCount() << " recycled\n";
}

int main() {
    ParticleSystem system;

    for (int frame = 0; frame < 60; ++frame) {
        for (int i = 0; i < 100; ++i) {
            system.emit(0.0f, 0.0f, 0.0f, 2.0f);
        }
        system.update(0.016f);
    }

    system.printStats();

    std::cout << "\n";

    benchmark("pool alloc+dealloc", 100000, [&]() {
        MemoryPool<Particle> pool;
        Particle* p = pool.allocate(1.0f, 2.0f, 3.0f, 5.0f);
        pool.deallocate(p);
    });

    benchmark("new+delete baseline", 100000, [&]() {
        Particle* p = new Particle(1.0f, 2.0f, 3.0f, 5.0f);
        delete p;
    });

    std::cout << "\n";

    runConcurrencyTest();

    return 0;
}
