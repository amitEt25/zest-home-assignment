export interface TaskResponse {
  id: string;
  message: string;
  status: string;
  createdAt: string;
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
