import { v4 as uuidv4 } from "uuid";
import { enqueueTask } from "./workerManager";
import { stats } from "./stats";

interface Task {
  id: string;
  message: string;
}

const taskQueue: Task[] = [];

export function addTask(message: string): string {
  const task: Task = {
    id: uuidv4(),
    message,
  };
  taskQueue.push(task);
  stats.setQueueLength(taskQueue.length);
  enqueueTask(task);
  return task.id;
}

export function getNextTask(): Task | undefined {
  const task = taskQueue.shift();
  stats.setQueueLength(taskQueue.length);
  return task;
}
