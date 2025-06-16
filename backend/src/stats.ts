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
    taskRetries,
    succeeded: tasksSucceeded,
    failed: tasksFailed,
    avgProcessingTime:
      tasksProcessed === 0 ? 0 : totalProcessingTime / tasksProcessed,
    currentQueueLength,
    idleWorkers,
    hotWorkers,
  }),
};
