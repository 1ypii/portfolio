using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace JobScheduler
{
    public enum JobStatus
    {
        Pending,
        Queued,
        Running,
        Completed,
        Failed,
        Cancelled,
        Skipped
    }

    public enum JobPriority
    {
        Low = 0,
        Normal = 1,
        High = 2,
        Critical = 3
    }

    public class RetryPolicy
    {
        public int MaxAttempts { get; set; } = 3;
        public TimeSpan BaseDelay { get; set; } = TimeSpan.FromSeconds(1);
        public double BackoffMultiplier { get; set; } = 2.0;

        public TimeSpan GetDelay(int attempt)
        {
            double ms = BaseDelay.TotalMilliseconds * Math.Pow(BackoffMultiplier, attempt - 1);
            return TimeSpan.FromMilliseconds(Math.Min(ms, 30000));
        }
    }

    public class JobResult
    {
        public string JobId { get; set; }
        public JobStatus Status { get; set; }
        public int Attempts { get; set; }
        public TimeSpan Duration { get; set; }
        public string Error { get; set; }
        public object Output { get; set; }
    }

    public class Job
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public JobPriority Priority { get; set; }
        public JobStatus Status { get; set; }
        public RetryPolicy Retry { get; set; }
        public List<string> DependsOn { get; set; }
        public Func<CancellationToken, IProgress<double>, Task<object>> Action { get; set; }
        public int Attempts { get; set; }
        public double Progress { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Error { get; set; }
        public object Output { get; set; }

        public Job()
        {
            Id = Guid.NewGuid().ToString("N")[..8];
            Status = JobStatus.Pending;
            Retry = new RetryPolicy();
            DependsOn = new List<string>();
            CreatedAt = DateTime.UtcNow;
        }
    }

    public class JobProgressEvent
    {
        public string JobId { get; set; }
        public string JobName { get; set; }
        public double Progress { get; set; }
        public JobStatus Status { get; set; }
    }

    public class Scheduler : IDisposable
    {
        private readonly ConcurrentDictionary<string, Job> registry = new();
        private readonly PriorityQueue<string, int> queue = new();
        private readonly SemaphoreSlim workerSlots;
        private readonly CancellationTokenSource shutdownSource = new();
        private readonly List<Task> workers = new();
        private readonly object queueLock = new();
        private bool disposed;

        public event Action<JobProgressEvent> OnProgress;
        public event Action<JobResult> OnComplete;

        public int Concurrency { get; }

        public Scheduler(int concurrency = 4)
        {
            Concurrency = concurrency;
            workerSlots = new SemaphoreSlim(concurrency, concurrency);
        }

        public string Submit(string name, Func<CancellationToken, IProgress<double>, Task<object>> action,
            JobPriority priority = JobPriority.Normal, RetryPolicy retry = null, List<string> dependsOn = null)
        {
            var job = new Job
            {
                Name = name,
                Priority = priority,
                Action = action,
                Retry = retry ?? new RetryPolicy(),
                DependsOn = dependsOn ?? new List<string>()
            };

            registry[job.Id] = job;

            if (job.DependsOn.Count == 0)
            {
                Enqueue(job);
            }

            return job.Id;
        }

        private void Enqueue(Job job)
        {
            job.Status = JobStatus.Queued;
            int inversePriority = (int)JobPriority.Critical - (int)job.Priority;

            lock (queueLock)
            {
                queue.Enqueue(job.Id, inversePriority);
            }

            var worker = Task.Run(() => ProcessNext(shutdownSource.Token));
            workers.Add(worker);
        }

        private async Task ProcessNext(CancellationToken shutdown)
        {
            await workerSlots.WaitAsync(shutdown);

            string jobId;
            lock (queueLock)
            {
                if (!queue.TryDequeue(out jobId, out _))
                {
                    workerSlots.Release();
                    return;
                }
            }

            try
            {
                if (registry.TryGetValue(jobId, out var job))
                {
                    await ExecuteJob(job, shutdown);
                }
            }
            finally
            {
                workerSlots.Release();
            }
        }

        private async Task ExecuteJob(Job job, CancellationToken shutdown)
        {
            if (shutdown.IsCancellationRequested)
            {
                job.Status = JobStatus.Cancelled;
                return;
            }

            var failedDeps = job.DependsOn
                .Where(d => registry.ContainsKey(d) && registry[d].Status == JobStatus.Failed)
                .ToList();

            if (failedDeps.Count > 0)
            {
                job.Status = JobStatus.Skipped;
                job.Error = $"Dependencies failed: {string.Join(", ", failedDeps)}";
                EmitResult(job);
                PropagateCompletion(job.Id);
                return;
            }

            job.Status = JobStatus.Running;
            job.StartedAt = DateTime.UtcNow;

            var progress = new Progress<double>(value =>
            {
                job.Progress = value;
                OnProgress?.Invoke(new JobProgressEvent
                {
                    JobId = job.Id,
                    JobName = job.Name,
                    Progress = value,
                    Status = job.Status
                });
            });

            string lastError = null;

            for (int attempt = 1; attempt <= job.Retry.MaxAttempts; attempt++)
            {
                job.Attempts = attempt;

                try
                {
                    job.Output = await job.Action(shutdown, progress);
                    job.Status = JobStatus.Completed;
                    job.CompletedAt = DateTime.UtcNow;
                    job.Progress = 1.0;
                    EmitResult(job);
                    PropagateCompletion(job.Id);
                    return;
                }
                catch (OperationCanceledException)
                {
                    job.Status = JobStatus.Cancelled;
                    job.CompletedAt = DateTime.UtcNow;
                    EmitResult(job);
                    return;
                }
                catch (Exception ex)
                {
                    lastError = ex.Message;

                    if (attempt < job.Retry.MaxAttempts)
                    {
                        var delay = job.Retry.GetDelay(attempt);
                        await Task.Delay(delay, shutdown);
                    }
                }
            }

            job.Status = JobStatus.Failed;
            job.Error = lastError;
            job.CompletedAt = DateTime.UtcNow;
            EmitResult(job);
            PropagateCompletion(job.Id);
        }

        private void PropagateCompletion(string completedJobId)
        {
            var dependents = registry.Values
                .Where(j => j.DependsOn.Contains(completedJobId) && j.Status == JobStatus.Pending)
                .ToList();

            foreach (var dependent in dependents)
            {
                bool allResolved = dependent.DependsOn.All(depId =>
                    registry.ContainsKey(depId) &&
                    (registry[depId].Status == JobStatus.Completed ||
                     registry[depId].Status == JobStatus.Failed ||
                     registry[depId].Status == JobStatus.Skipped));

                if (allResolved)
                {
                    Enqueue(dependent);
                }
            }
        }

        private void EmitResult(Job job)
        {
            OnComplete?.Invoke(new JobResult
            {
                JobId = job.Id,
                Status = job.Status,
                Attempts = job.Attempts,
                Duration = (job.CompletedAt ?? DateTime.UtcNow) - (job.StartedAt ?? job.CreatedAt),
                Error = job.Error,
                Output = job.Output
            });
        }

        public Job GetJob(string jobId)
        {
            return registry.TryGetValue(jobId, out var job) ? job : null;
        }

        public void Cancel()
        {
            shutdownSource.Cancel();

            foreach (var job in registry.Values.Where(j =>
                j.Status == JobStatus.Pending || j.Status == JobStatus.Queued))
            {
                job.Status = JobStatus.Cancelled;
            }
        }

        public async Task WaitAll(TimeSpan? timeout = null)
        {
            var deadline = timeout.HasValue
                ? Task.Delay(timeout.Value)
                : Task.Delay(Timeout.InfiniteTimeSpan);

            while (registry.Values.Any(j =>
                j.Status == JobStatus.Pending ||
                j.Status == JobStatus.Queued ||
                j.Status == JobStatus.Running))
            {
                if (deadline.IsCompleted) break;
                await Task.Delay(50);
            }
        }

        public string GetSummary()
        {
            var groups = registry.Values
                .GroupBy(j => j.Status)
                .OrderBy(g => g.Key);

            var lines = new List<string>
            {
                $"{"job",-25} {"status",-12} {"priority",-10} {"attempts",-10} {"duration",-12} {"error"}",
                new string('-', 90)
            };

            foreach (var job in registry.Values.OrderBy(j => j.CreatedAt))
            {
                var duration = (job.CompletedAt ?? DateTime.UtcNow) - (job.StartedAt ?? job.CreatedAt);
                var error = job.Error ?? "";
                if (error.Length > 30) error = error[..30] + "...";

                lines.Add($"{job.Name,-25} {job.Status,-12} {job.Priority,-10} {job.Attempts,-10} {duration.TotalMilliseconds,-12:F1}ms {error}");
            }

            lines.Add(new string('-', 90));

            var completed = registry.Values.Count(j => j.Status == JobStatus.Completed);
            var total = registry.Count;
            lines.Add($"{completed}/{total} jobs completed successfully");

            return string.Join("\n", lines);
        }

        public void Dispose()
        {
            if (disposed) return;
            disposed = true;
            shutdownSource.Cancel();
            shutdownSource.Dispose();
            workerSlots.Dispose();
        }
    }

    class Program
    {
        static async Task Main()
        {
            using var scheduler = new Scheduler(concurrency: 3);

            scheduler.OnProgress += e =>
                Console.WriteLine($"  [{e.JobName}] {e.Progress:P0}");

            scheduler.OnComplete += r =>
                Console.WriteLine($"  [{r.JobId}] {r.Status} in {r.Duration.TotalMilliseconds:F0}ms ({r.Attempts} attempts)");

            var fetchId = scheduler.Submit("fetch data", async (ct, progress) =>
            {
                for (int i = 1; i <= 5; i++)
                {
                    await Task.Delay(100, ct);
                    progress.Report(i / 5.0);
                }
                return new { Records = 1500 };
            }, JobPriority.High);

            var validateId = scheduler.Submit("validate schema", async (ct, progress) =>
            {
                await Task.Delay(200, ct);
                progress.Report(1.0);
                return new { Valid = true };
            }, dependsOn: new List<string> { fetchId });

            var transformId = scheduler.Submit("transform records", async (ct, progress) =>
            {
                for (int i = 1; i <= 10; i++)
                {
                    await Task.Delay(50, ct);
                    progress.Report(i / 10.0);
                }
                return new { Transformed = 1500 };
            }, JobPriority.High, dependsOn: new List<string> { validateId });

            scheduler.Submit("generate report", async (ct, progress) =>
            {
                await Task.Delay(300, ct);
                progress.Report(1.0);
                return new { Pages = 12 };
            }, dependsOn: new List<string> { transformId });

            scheduler.Submit("send notifications", async (ct, progress) =>
            {
                await Task.Delay(150, ct);
                progress.Report(1.0);
                return new { Sent = 45 };
            }, dependsOn: new List<string> { transformId });

            await scheduler.WaitAll(TimeSpan.FromSeconds(30));

            Console.WriteLine("\n" + scheduler.GetSummary());
        }
    }
}
