export interface TaskResponse {
  taskId: string;
}

export interface StatsResponse {
  tasksProcessed: number;
  succeeded: number;
  failed: number;
  taskRetries: number;
  avgProcessingTime: number;
  currentQueueLength: number;
  idleWorkers: number;
  hotWorkers: number;
}
