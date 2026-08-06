class ReactiveStore {
    constructor(initialState = {}, options = {}) {
        this.state = { ...initialState };
        this.listeners = new Map();
        this.computedDefs = new Map();
        this.computedCache = new Map();
        this.middlewares = [];
        this.history = [];
        this.maxHistory = options.maxHistory || 100;
        this.batching = false;
        this.pendingKeys = new Set();
    }

    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }

    computed(key, deps, compute) {
        this.computedDefs.set(key, { deps, compute });
        this.computedCache.delete(key);
        return this;
    }

    getComputed(key) {
        if (!this.computedDefs.has(key)) {
            return undefined;
        }

        const cached = this.computedCache.get(key);
        const def = this.computedDefs.get(key);
        const currentDeps = def.deps.map((d) => this.state[d]);

        if (cached && cached.deps.length === currentDeps.length) {
            const unchanged = cached.deps.every((v, i) => v === currentDeps[i]);
            if (unchanged) {
                return cached.value;
            }
        }

        const value = def.compute(this.state);
        this.computedCache.set(key, { deps: currentDeps, value });
        return value;
    }

    get(key) {
        if (this.computedDefs.has(key)) {
            return this.getComputed(key);
        }
        return this.state[key];
    }

    set(key, value) {
        const prev = this.state[key];

        if (Object.is(prev, value)) {
            return;
        }

        const action = { type: "SET", key, value, prev, timestamp: Date.now() };

        const execute = (act) => {
            this.state[act.key] = act.value;

            this.history.push({
                key: act.key,
                prev: act.prev,
                value: act.value,
                timestamp: act.timestamp,
            });

            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }

            this.invalidateComputed(act.key);

            if (this.batching) {
                this.pendingKeys.add(act.key);
            } else {
                this.notify(act.key);
            }
        };

        const chain = this.middlewares.reduceRight(
            (next, mw) => (a) => mw(a, this.state, next),
            execute
        );

        chain(action);
    }

    batch(fn) {
        this.batching = true;
        this.pendingKeys.clear();

        fn(this);

        this.batching = false;
        const keys = new Set(this.pendingKeys);
        this.pendingKeys.clear();

        for (const key of keys) {
            this.notify(key);
        }
    }

    invalidateComputed(changedKey) {
        for (const [compKey, def] of this.computedDefs) {
            if (def.deps.includes(changedKey)) {
                this.computedCache.delete(compKey);
            }
        }
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }

        this.listeners.get(key).add(callback);

        return () => {
            const subs = this.listeners.get(key);
            if (subs) {
                subs.delete(callback);
                if (subs.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }

    notify(key) {
        const subs = this.listeners.get(key);
        if (subs) {
            for (const cb of subs) {
                cb(this.state[key], key);
            }
        }

        for (const [compKey, def] of this.computedDefs) {
            if (def.deps.includes(key)) {
                const compSubs = this.listeners.get(compKey);
                if (compSubs) {
                    const value = this.getComputed(compKey);
                    for (const cb of compSubs) {
                        cb(value, compKey);
                    }
                }
            }
        }
    }

    snapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }

    getHistory() {
        return [...this.history];
    }

    reset(newState = {}) {
        const keys = new Set([...Object.keys(this.state), ...Object.keys(newState)]);
        this.state = { ...newState };
        this.computedCache.clear();
        this.history = [];

        for (const key of keys) {
            this.notify(key);
        }
    }

    destroy() {
        this.listeners.clear();
        this.computedDefs.clear();
        this.computedCache.clear();
        this.middlewares.length = 0;
        this.history.length = 0;
        this.state = {};
    }
}

const logger = (action, state, next) => {
    console.log(`[${action.key}] ${JSON.stringify(action.prev)} -> ${JSON.stringify(action.value)}`);
    next(action);
};

const store = new ReactiveStore({ price: 10, quantity: 3, tax: 0.08 }, { maxHistory: 50 });

store.use(logger);

store.computed("subtotal", ["price", "quantity"], (s) => s.price * s.quantity);
store.computed("total", ["price", "quantity", "tax"], (s) => s.price * s.quantity * (1 + s.tax));

store.subscribe("total", (value) => {
    console.log(`total updated: ${value.toFixed(2)}`);
});

store.batch((s) => {
    s.set("price", 25);
    s.set("quantity", 7);
});

console.log("subtotal:", store.get("subtotal"));
console.log("total:", store.get("total").toFixed(2));
