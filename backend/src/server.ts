import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { addTask } from "./taskQueue";
import { stats } from "./stats";
import fs from "fs";
import path from "path";

dotenv.config();
const app = express();
const port = process.env.SERVER_PORT || 4000;

app.use(express.json());

const logsDir = path.join(__dirname, "..", "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const requiredEnv = [
  "SERVER_PORT",
  "TASK_SIMULATED_DURATION",
  "TASK_SIMULATED_ERROR_PERCENTAGE",
  "TASK_ERROR_RETRY_DELAY",
  "WORKER_TIMEOUT",
  "TASK_MAX_RETRIES",
];

const missing = requiredEnv.filter((v) => !process.env[v]);
if (missing.length) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
  process.exit(1);
}

app.post("/tasks", (req: Request, res: Response): void => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ error: "Missing message" });
    return;
  }

  const taskId = addTask(message);
  res.json({ taskId });
});

app.get("/statistics", (req: Request, res: Response): void => {
  res.json(stats.getStats());
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
