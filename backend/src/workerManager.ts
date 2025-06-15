import os from "os";
import { getNextTask } from "./taskQueue";
import { stats } from "./stats";
import { logTask } from "./logger";

const maxWorkers = os.cpus().length;
const workers: Worker[] = [];
const completedTasks = new Set<string>();

interface Worker {
  id: string;
  timeout?: NodeJS.Timeout;
  busy: boolean;
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
    runTask(idleWorker, task);
  }
}

async function runTask(worker: Worker, task: { id: string; message: string }) {
  if (completedTasks.has(task.id)) {
    return;
  }
  worker.busy = true;
  stats.setHotWorkers(workers.filter((w) => w.busy).length);
  stats.setIdleWorkers(workers.filter((w) => !w.busy).length);

  let attempt = 0;
  const maxRetries = parseInt(process.env.TASK_MAX_RETRIES || "2");
  const retryDelay = parseInt(process.env.TASK_ERROR_RETRY_DELAY || "1000");
  const duration = parseInt(process.env.TASK_SIMULATED_DURATION || "500");
  const failRate = parseInt(process.env.TASK_SIMULATED_ERROR_PERCENTAGE || "70");

  while (attempt <= maxRetries) {
    attempt++;
    stats.incrementProcessed();

    const start = Date.now();
    await sleep(duration);
    const elapsed = Date.now() - start;
    stats.addProcessingTime(elapsed);

    const failed = Math.random() * 100 < failRate;
    if (!failed) {
      if (!completedTasks.has(task.id)) {
        completedTasks.add(task.id);
        await logTask(worker.id, task.id, task.message, "SUCCESS");
        stats.incrementSuccess();
      }
      break;
    } else {
      stats.incrementRetry();
      if (attempt > maxRetries) {
        if (!completedTasks.has(task.id)) {
          completedTasks.add(task.id);
          await logTask(worker.id, task.id, task.message, "FAILURE");
          stats.incrementFailure();
        }
        break;
      }
      await sleep(retryDelay);
    }
  }

  worker.busy = false;
  stats.setHotWorkers(workers.filter((w) => w.busy).length);
  stats.setIdleWorkers(workers.filter((w) => !w.busy).length);

  const nextTask = getNextTask();
  if (nextTask) {
    runTask(worker, nextTask);
  } else {
    const timeout = parseInt(process.env.WORKER_TIMEOUT || "10000");
    worker.timeout = setTimeout(() => {
      const idx = workers.indexOf(worker);
      if (idx !== -1 && !worker.busy) workers.splice(idx, 1);
      stats.setIdleWorkers(workers.filter((w) => !w.busy).length);
    }, timeout);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
