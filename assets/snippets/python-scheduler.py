from __future__ import annotations

import asyncio
import time
from enum import Enum
from dataclasses import dataclass, field
from typing import Callable, Awaitable
from collections import defaultdict


class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class TaskResult:
    task_id: str
    status: TaskStatus
    duration: float
    attempts: int
    error: str | None = None


@dataclass
class Task:
    id: str
    action: Callable[[], Awaitable[None]]
    depends_on: list[str] = field(default_factory=list)
    max_retries: int = 3
    retry_delay: float = 1.0
    status: TaskStatus = TaskStatus.PENDING
    attempts: int = 0


class CyclicDependencyError(Exception):
    pass


class Scheduler:
    def __init__(self, concurrency: int = 4) -> None:
        self.concurrency = concurrency
        self.tasks: dict[str, Task] = {}
        self.results: dict[str, TaskResult] = {}

    def add(
        self,
        task_id: str,
        action: Callable[[], Awaitable[None]],
        depends_on: list[str] | None = None,
        max_retries: int = 3,
        retry_delay: float = 1.0,
    ) -> None:
        self.tasks[task_id] = Task(
            id=task_id,
            action=action,
            depends_on=depends_on or [],
            max_retries=max_retries,
            retry_delay=retry_delay,
        )

    def _resolve_order(self) -> list[list[str]]:
        graph: dict[str, set[str]] = defaultdict(set)
        in_degree: dict[str, int] = {tid: 0 for tid in self.tasks}

        for tid, task in self.tasks.items():
            for dep in task.depends_on:
                if dep not in self.tasks:
                    raise ValueError(f"Task '{tid}' depends on unknown task '{dep}'")
                graph[dep].add(tid)
                in_degree[tid] += 1

        queue = [tid for tid, deg in in_degree.items() if deg == 0]
        layers: list[list[str]] = []
        visited = 0

        while queue:
            layers.append(list(queue))
            next_queue: list[str] = []

            for tid in queue:
                visited += 1
                for neighbor in graph[tid]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        next_queue.append(neighbor)

            queue = next_queue

        if visited != len(self.tasks):
            raise CyclicDependencyError("Detected a cycle in task dependencies")

        return layers

    async def _execute_task(self, task: Task) -> TaskResult:
        deps_failed = any(
            self.results.get(dep, TaskResult(dep, TaskStatus.FAILED, 0, 0)).status == TaskStatus.FAILED
            for dep in task.depends_on
        )

        if deps_failed:
            task.status = TaskStatus.SKIPPED
            return TaskResult(task.id, TaskStatus.SKIPPED, 0.0, 0, error="Dependency failed")

        task.status = TaskStatus.RUNNING
        start = time.monotonic()
        last_error: str | None = None

        for attempt in range(1, task.max_retries + 1):
            task.attempts = attempt
            try:
                await task.action()
                task.status = TaskStatus.COMPLETED
                elapsed = time.monotonic() - start
                return TaskResult(task.id, TaskStatus.COMPLETED, round(elapsed, 4), attempt)
            except Exception as exc:
                last_error = str(exc)
                if attempt < task.max_retries:
                    await asyncio.sleep(task.retry_delay * attempt)

        task.status = TaskStatus.FAILED
        elapsed = time.monotonic() - start
        return TaskResult(task.id, TaskStatus.FAILED, round(elapsed, 4), task.attempts, error=last_error)

    async def _run_layer(self, layer: list[str], semaphore: asyncio.Semaphore) -> None:
        async def guarded(task: Task) -> None:
            async with semaphore:
                result = await self._execute_task(task)
                self.results[task.id] = result

        await asyncio.gather(*(guarded(self.tasks[tid]) for tid in layer))

    async def run(self) -> dict[str, TaskResult]:
        layers = self._resolve_order()
        semaphore = asyncio.Semaphore(self.concurrency)

        for layer in layers:
            await self._run_layer(layer, semaphore)

        return dict(self.results)

    def summary(self) -> str:
        lines = [f"{'Task':<20} {'Status':<12} {'Attempts':<10} {'Duration':<10} {'Error'}"]
        lines.append("-" * 75)

        for tid, result in self.results.items():
            error_display = result.error or ""
            lines.append(
                f"{tid:<20} {result.status.value:<12} {result.attempts:<10} {result.duration:<10.4f} {error_display}"
            )

        completed = sum(1 for r in self.results.values() if r.status == TaskStatus.COMPLETED)
        total = len(self.results)
        lines.append("-" * 75)
        lines.append(f"{completed}/{total} tasks completed successfully")

        return "\n".join(lines)


async def main() -> None:
    scheduler = Scheduler(concurrency=3)

    async def fetch_users() -> None:
        await asyncio.sleep(0.3)

    async def fetch_orders() -> None:
        await asyncio.sleep(0.2)

    async def validate_data() -> None:
        await asyncio.sleep(0.1)

    async def generate_report() -> None:
        await asyncio.sleep(0.4)

    async def send_notification() -> None:
        await asyncio.sleep(0.1)

    scheduler.add("fetch_users", fetch_users)
    scheduler.add("fetch_orders", fetch_orders)
    scheduler.add("validate_data", validate_data, depends_on=["fetch_users", "fetch_orders"])
    scheduler.add("generate_report", generate_report, depends_on=["validate_data"])
    scheduler.add("send_notification", send_notification, depends_on=["generate_report"])

    await scheduler.run()
    print(scheduler.summary())


if __name__ == "__main__":
    asyncio.run(main())
