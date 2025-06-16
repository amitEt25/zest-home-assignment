import fs from "fs/promises";
import path from "path";

const logFile = path.join(__dirname, "../../logs/tasks.log");

let lock = Promise.resolve();

export async function logTask(
  workerId: string,
  taskId: string,
  message: string,
  status: "SUCCESS" | "FAILURE"
) {
  const timestamp = new Date().toISOString();
  const line = `${timestamp} | Worker ${workerId} | Task ${taskId} | ${status} | ${message}\n`;

  lock = lock
    .then(() => fs.appendFile(logFile, line))
    .catch((err) => {
      console.error("Log write error:", err);
    });

  await lock;
}
