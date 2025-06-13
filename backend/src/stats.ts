let tasksProcessed = 0;
let taskRetries = 0;
let taskSucceeded = 0;
let taskFailed = 0;
let totalProcessingTime = 0;
let totalAttempts = 0;
let currentQueueLength = 0;
let idleWorkers = 0;
let hotWorkers = 0;

export const stats = {
  incrementProcessed: () => tasksProcessed++,
  incrementRetry: () => taskRetries++,
  incrementSuccess: () => taskSucceeded++,
  incrementFailure: () => taskFailed++,
  addProcessingTime: (ms: number) => {
    totalProcessingTime += ms;
    totalAttempts++;
  },
  setQueueLength: (length: number) => (currentQueueLength = length),
  setIdleWorkers: (count: number) => (idleWorkers = count),
  setHotWorkers: (count: number) => (hotWorkers = count),
  getStats: () => ({
    tasksProcessed,
    taskRetries,
    succeeded: taskSucceeded,
    failed: taskFailed,
    avgProcessingTime:
      totalAttempts === 0 ? 0 : totalProcessingTime / totalAttempts,
    currentQueueLength,
    idleWorkers,
    hotWorkers,
  }),
};
