let tasksProcessed = 0;
let taskRetries = 0;
let tasksSucceeded = 0;
let tasksFailed = 0;
let totalProcessingTime = 0;
let currentQueueLength = 0;
let idleWorkers = 0;
let hotWorkers = 0;

export const stats = {
  incrementProcessed: () => tasksProcessed++,
  incrementRetry: () => taskRetries++,
  incrementSuccess: () => tasksSucceeded++,
  incrementFailure: () => tasksFailed++,
  addProcessingTime: (ms: number) => {
    totalProcessingTime += ms;
  },
  setQueueLength: (length: number) => (currentQueueLength = length),
  setIdleWorkers: (count: number) => (idleWorkers = count),
  setHotWorkers: (count: number) => (hotWorkers = count),
  getStats: () => ({
    tasksProcessed,
    tasksCompleted: tasksSucceeded + tasksFailed,
    taskRetries,
    succeeded: tasksSucceeded,
    failed: tasksFailed,
    avgProcessingTime:
      tasksProcessed === 0
        ? 0
        : Math.round(totalProcessingTime / tasksProcessed),
    currentQueueLength,
    idleWorkers,
    hotWorkers,
    totalWorkers: idleWorkers + hotWorkers,
    successRate:
      tasksProcessed === 0
        ? 0
        : Math.round((tasksSucceeded / tasksProcessed) * 100),
    failureRate:
      tasksProcessed === 0
        ? 0
        : Math.round((tasksFailed / tasksProcessed) * 100),
  }),
  reset: () => {
    tasksProcessed = 0;
    taskRetries = 0;
    tasksSucceeded = 0;
    tasksFailed = 0;
    totalProcessingTime = 0;
    currentQueueLength = 0;
    idleWorkers = 0;
    hotWorkers = 0;
  },
};
