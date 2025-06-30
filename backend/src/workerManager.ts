import os from "os";
import { getNextTask } from "./taskQueue";
import { stats } from "./stats";
import { logTask } from "./logger";
import { TaskProcessor } from "./taskProcessor";

const maxWorkers = os.cpus().length;
const taskProcessor = TaskProcessor.getInstance();

const workers: Worker[] = [];
const completedTasks = new Set<string>();
const inProgressTasks = new Set<string>();
const MAX_COMPLETED_TASKS = 1000; // Limit memory usage

interface Worker {
  id: string;
  timeout?: NodeJS.Timeout;
  busy: boolean;
  currentTask?: { id: string; message: string };
}

function createWorker(): Worker {
  const worker: Worker = {
    id: Math.random().toString(36).slice(2),
    busy: false,
  };
  workers.push(worker);
  return worker;
}

export function enqueueTask(task: { id: string; message: string }) {
  let idleWorker = workers.find((w) => !w.busy);

  if (!idleWorker && workers.length < maxWorkers) {
    idleWorker = createWorker();
  }

  if (idleWorker) {
    executeWithRetries(idleWorker, task);
  }
}

async function executeWithRetries(
  worker: Worker,
  task: { id: string; message: string }
) {
  if (completedTasks.has(task.id) || inProgressTasks.has(task.id)) {
    return;
  }

  inProgressTasks.add(task.id);
  worker.currentTask = task;
  worker.busy = true;
  updateWorkerStats();

  const maxRetries = parseInt(process.env.TASK_MAX_RETRIES || "2");
  const retryDelay = parseInt(process.env.TASK_ERROR_RETRY_DELAY || "1000");
  let attempt = 0;
  let taskCompleted = false;

  stats.incrementProcessed();

  while (attempt <= maxRetries && !taskCompleted) {
    attempt++;

    try {
      const result = await taskProcessor.processTask(task.id, task.message);
      stats.addProcessingTime(result.duration);

      if (result.success) {
        stats.incrementSuccess();
        taskCompleted = true;
        await logTask(worker.id, task.id, task.message, "SUCCESS");
      } else {
        if (attempt <= maxRetries) {
          stats.incrementRetry();
          await sleep(retryDelay);
        } else {
          stats.incrementFailure();
          taskCompleted = true;
          await logTask(worker.id, task.id, task.message, "FAILURE");
        }
      }
    } catch (error) {
      if (attempt <= maxRetries) {
        stats.incrementRetry();
        await sleep(retryDelay);
      } else {
        stats.incrementFailure();
        taskCompleted = true;
        await logTask(worker.id, task.id, task.message, "FAILURE");
      }
    }
  }

  completedTasks.add(task.id);
  inProgressTasks.delete(task.id);
  worker.currentTask = undefined;
  worker.busy = false;

  cleanupCompletedTasks();

  if (worker.timeout) {
    clearTimeout(worker.timeout);
    worker.timeout = undefined;
  }

  updateWorkerStats();
  maybeRunNext(worker);
}

function maybeRunNext(worker: Worker) {
  const nextTask = getNextTask();
  if (nextTask) {
    executeWithRetries(worker, nextTask);
  } else {
    const timeout = parseInt(process.env.WORKER_TIMEOUT || "10000");
    worker.timeout = setTimeout(() => {
      const idx = workers.indexOf(worker);
      if (idx !== -1 && !worker.busy) {
        workers.splice(idx, 1);
        updateWorkerStats();
      }
    }, timeout);
  }
}

function updateWorkerStats() {
  const busyWorkers = workers.filter((w) => w.busy).length;
  const idleWorkers = workers.filter((w) => !w.busy).length;
  stats.setHotWorkers(busyWorkers);
  stats.setIdleWorkers(idleWorkers);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getWorkerStats() {
  return {
    totalWorkers: workers.length,
    busyWorkers: workers.filter((w) => w.busy).length,
    idleWorkers: workers.filter((w) => !w.busy).length,
    completedTasks: completedTasks.size,
    inProgressTasks: inProgressTasks.size,
    maxWorkers: maxWorkers,
  };
}

export function resetWorkers() {
  workers.forEach((worker) => {
    if (worker.timeout) {
      clearTimeout(worker.timeout);
    }
  });

  workers.length = 0;
  completedTasks.clear();
  inProgressTasks.clear();
  updateWorkerStats();
}

export async function shutdownWorkers(): Promise<void> {
  workers.forEach((worker) => {
    if (worker.timeout) {
      clearTimeout(worker.timeout);
    }
  });
}

function cleanupCompletedTasks() {
  if (completedTasks.size > MAX_COMPLETED_TASKS) {
    const tasksArray = Array.from(completedTasks);
    const tasksToRemove = tasksArray.slice(
      0,
      completedTasks.size - MAX_COMPLETED_TASKS
    );
    tasksToRemove.forEach((taskId) => completedTasks.delete(taskId));
  }
}
