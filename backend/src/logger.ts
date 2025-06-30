import fs from "fs/promises";
import path from "path";

const logFile = path.join(__dirname, "../../logs/tasks.log");

export async function logTask(
  workerId: string,
  taskId: string,
  message: string,
  status: "SUCCESS" | "FAILURE"
) {
  const timestamp = new Date().toISOString();
  const line = `${timestamp} | Worker ${workerId} | Task ${taskId} | ${status} | ${message}\n`;

  try {
    await fs.appendFile(logFile, line, { flag: "a" });
  } catch (err) {
    console.error("Log write error:", err);
  }
}

export async function readLogs(): Promise<string> {
  try {
    return await fs.readFile(logFile, "utf-8");
  } catch (err) {
    if ((err as any).code === "ENOENT") {
      return "";
    }
    throw err;
  }
}

export async function clearLogs(): Promise<void> {
  try {
    await fs.writeFile(logFile, "");
  } catch (err) {
    console.error("Log clear error:", err);
  }
}
