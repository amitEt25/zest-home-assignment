import { EventEmitter } from 'events';
import { TaskProcessor } from './taskProcessor';

export interface TaskResult {
  success: boolean;
  duration: number;
  error?: string;
}

export interface Task {
  id: string;
  message: string;
  resolve: (result: TaskResult) => void;
  reject: (error: Error) => void;
  startTime: number;
}

export class SubprocessManager extends EventEmitter {
  private maxWorkers: number;
  private activeWorkers: Set<string> = new Set();
  private taskQueue: Task[] = [];
  private isShuttingDown = false;
  private taskProcessor: TaskProcessor;

  constructor(maxWorkers: number = 4) {
    super();
    this.maxWorkers = maxWorkers;
    this.taskProcessor = TaskProcessor.getInstance();
  }

  async runSubprocessTask(taskId: string, message: string): Promise<TaskResult> {
    if (this.isShuttingDown) {
      throw new Error('Worker pool is shutting down');
    }

    return new Promise((resolve, reject) => {
      const task: Task = {
        id: taskId,
        message,
        resolve,
        reject,
        startTime: Date.now()
      };

      this.taskQueue.push(task);
      this.processNextTask();
    });
  }

  private async processNextTask(): Promise<void> {
    if (this.activeWorkers.size >= this.maxWorkers || this.taskQueue.length === 0) {
      return;
    }

    const task = this.taskQueue.shift();
    if (!task) return;

    const workerId = this.createWorker();
    this.activeWorkers.add(workerId);

    try {
      const result = await this.taskProcessor.processTask(task.id, task.message);
      task.resolve(result);
    } catch (error) {
      task.reject(error as Error);
    } finally {
      this.activeWorkers.delete(workerId);
      this.processNextTask();
    }
  }

  private createWorker(): string {
    return Math.random().toString(36).slice(2);
  }

  getStats() {
    return {
      maxWorkers: this.maxWorkers,
      activeWorkers: this.activeWorkers.size,
      queuedTasks: this.taskQueue.length,
      isShuttingDown: this.isShuttingDown
    };
  }

  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    while (this.activeWorkers.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.taskQueue.forEach(task => {
      task.reject(new Error('Worker pool shutdown'));
    });
    this.taskQueue = [];
    
    this.emit('shutdown');
  }
} 