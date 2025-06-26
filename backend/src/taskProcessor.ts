import { fork } from "child_process";
import path from "path";

export interface TaskResult {
  success: boolean;
  duration: number;
  error?: string;
}

export class TaskProcessor {
  private static instance: TaskProcessor;

  private constructor() {}

  static getInstance(): TaskProcessor {
    if (!TaskProcessor.instance) {
      TaskProcessor.instance = new TaskProcessor();
    }
    return TaskProcessor.instance;
  }

  async processTask(taskId: string, message: string): Promise<TaskResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
  
      const childProcess = fork(path.join(__dirname, "taskWorker.js"), [], {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
      });
  
      let output = "";
      let errorOutput = "";
      let finished = false;
  
      if (childProcess.stdout) {
        childProcess.stdout.on("data", (data) => {
          output += data.toString();
        });
      }
  
      if (childProcess.stderr) {
        childProcess.stderr.on("data", (data) => {
          errorOutput += data.toString();
        });
      }
  
      const timeout = parseInt(process.env.TASK_TIMEOUT || "30000");
      const timeoutId = setTimeout(() => {
        if (!childProcess.killed && !finished) {
          childProcess.kill("SIGTERM");
          finished = true;
          const duration = Date.now() - startTime;
          resolve({
            success: false,
            duration,
            error: "Task timeout",
          });
        }
      }, timeout);
  
      childProcess.on("message", (msg: any) => {
        clearTimeout(timeoutId);
        if (finished) return;
        finished = true;
  
        const duration = Date.now() - startTime;
  
        resolve({
          success: msg.success ?? false,
          duration: msg.duration ?? duration,
          error: msg.error ?? (msg.success ? undefined : "Task failed without error message"),
        });
      });
  
      childProcess.on("error", (error) => {
        clearTimeout(timeoutId);
        if (finished) return;
        finished = true;
        const duration = Date.now() - startTime;
        resolve({
          success: false,
          duration,
          error: error.message,
        });
      });
  
      childProcess.on("exit", () => {
      });
  
      childProcess.send({ taskId, message });
    });
  }
}