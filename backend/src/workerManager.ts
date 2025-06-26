import os from "os";
import { getNextTask } from "./taskQueue";
import { stats } from "./stats";
import { logTask } from "./logger";
import { SubprocessManager } from "./subprocessManager";

const maxWorkers = os.cpus().length;

const subprocessManager = new SubprocessManager(maxWorkers);
const workers: Worker[] = [];
const completedTasks = new Set<string>();
const inProgressTasks = new Set<string>();

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

async function executeWithRetries(worker: Worker, task: { id: string; message: string }) {
  if (completedTasks.has(task.id) || inProgressTasks.has(task.id)) return;

  inProgressTasks.add(task.id);
  worker.currentTask = task;

  if (worker.timeout) {
    clearTimeout(worker.timeout);
    worker.timeout = undefined;
  }

  worker.busy = true;
  updateWorkerStats();

  const startTime = new Date().toISOString();
  const maxRetries = parseInt(process.env.TASK_MAX_RETRIES || "2");
  const retryDelay = parseInt(process.env.TASK_ERROR_RETRY_DELAY || "1000");
  let attempt = 0;
  let result;

  while (attempt <= maxRetries) {
    attempt++;
    stats.incrementProcessed();

    try {
      result = await subprocessManager.runSubprocessTask(task.id, task.message);
      stats.addProcessingTime(result.duration);
      if (result.success) break;
      stats.incrementRetry();
      await sleep(retryDelay);
    } catch (error) {
      stats.incrementRetry();
      await sleep(retryDelay);
    }
  }

  const endTime = new Date().toISOString();

  if (!result) result = { success: false, duration: 0, error: 'Unknown error' };

  if (result.success) {
    completedTasks.add(task.id);
    stats.incrementSuccess();
    try {
      await logTask(worker.id, task.id, `${task.message} | start: ${startTime} | end: ${endTime}`, "SUCCESS");
    } catch (e) {
      console.error("Failed to log success", e);
    }
  } else {
    completedTasks.add(task.id);
    stats.incrementFailure();
    try {
      await logTask(worker.id, task.id, `${task.message} | start: ${startTime} | end: ${endTime} | error: ${result.error || 'Unknown error'}`, "FAILURE");
    } catch (e) {
      console.error("Failed to log failure", e);
    }
  }

  inProgressTasks.delete(task.id);
  worker.busy = false;
  worker.currentTask = undefined;
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getWorkerStats() {
  const poolStats = subprocessManager.getStats();
  return {
    totalWorkers: workers.length,
    busyWorkers: workers.filter((w) => w.busy).length,
    idleWorkers: workers.filter((w) => !w.busy).length,
    completedTasks: completedTasks.size,
    inProgressTasks: inProgressTasks.size,
    maxPoolWorkers: poolStats.maxWorkers,
    activePoolWorkers: poolStats.activeWorkers,
    queuedPoolTasks: poolStats.queuedTasks,
  };
}

export function resetWorkers() {
  workers.forEach(worker => {
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
  await subprocessManager.shutdown();
}
