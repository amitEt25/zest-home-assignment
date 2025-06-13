// src/server.ts
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { addTask } from "./taskQueue";
import { stats } from "./stats";

dotenv.config();
const app = express();
const port = process.env.SERVER_PORT || 4000;

app.use(express.json());

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
