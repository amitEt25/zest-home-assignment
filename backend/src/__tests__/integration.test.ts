import request from "supertest";
import { app } from "../server";
import { stats } from "../stats";
import { readLogs, clearLogs } from "../logger";

async function waitForTaskCompletion(
  expectedTasks: number,
  timeoutMs = 5000
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const statsRes = await request(app).get("/statistics");
    const currentStats = statsRes.body;
    if (currentStats.succeeded + currentStats.failed >= expectedTasks) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timeout waiting for ${expectedTasks} tasks to complete`);
}

describe("Integration Tests", () => {
  beforeEach(async () => {
    stats.reset();
    await clearLogs();
  });

  test("should enqueue and process single task successfully", async () => {
    const testMessage = "integration test message";

    const res = await request(app)
      .post("/tasks")
      .send({ message: testMessage })
      .expect(200);

    expect(res.body).toHaveProperty("taskId");
    expect(typeof res.body.taskId).toBe("string");

    await waitForTaskCompletion(1, 3000);

    const statsRes = await request(app).get("/statistics").expect(200);

    expect(statsRes.body.tasksCompleted).toBe(1);
    expect(statsRes.body.succeeded + statsRes.body.failed).toBe(1);

    const logs = await readLogs();
    expect(logs).toContain(testMessage);
    expect(logs).toContain(res.body.taskId);
    expect(logs).toMatch(/SUCCESS|FAILURE/);
  });

  test("should handle multiple concurrent tasks", async () => {
    const numTasks = 5;
    const taskPromises = [];

    for (let i = 0; i < numTasks; i++) {
      taskPromises.push(
        request(app)
          .post("/tasks")
          .send({ message: `concurrent task ${i}` })
          .expect(200)
      );
    }

    const responses = await Promise.all(taskPromises);
    const taskIds = responses.map((r) => r.body.taskId);

    expect(new Set(taskIds).size).toBe(numTasks);

    await waitForTaskCompletion(numTasks, 8000);

    const statsRes = await request(app).get("/statistics").expect(200);

    expect(statsRes.body.tasksCompleted).toBe(numTasks);
    expect(statsRes.body.succeeded + statsRes.body.failed).toBe(numTasks);

    const logs = await readLogs();
    taskIds.forEach((taskId) => {
      expect(logs).toContain(taskId);
    });
  });

  test("should track retries correctly", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ message: "retry test task" })
      .expect(200);

    await waitForTaskCompletion(1, 5000);

    const statsRes = await request(app).get("/statistics").expect(200);

    expect(statsRes.body.tasksCompleted).toBe(1);
    expect(statsRes.body.succeeded + statsRes.body.failed).toBe(1);

    if (statsRes.body.failed > 0) {
      expect(statsRes.body.taskRetries).toBeGreaterThan(0);
    }

    expect(statsRes.body.avgProcessingTime).toBeGreaterThan(0);
  });

  test("should validate processing time calculations", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ message: "timing test" })
      .expect(200);

    const startTime = Date.now();
    await waitForTaskCompletion(1, 5000);
    const endTime = Date.now();

    const statsRes = await request(app).get("/statistics").expect(200);

    const expectedMinTime = parseInt(
      process.env.TASK_SIMULATED_DURATION || "500",
      10
    );
    expect(statsRes.body.avgProcessingTime).toBeGreaterThanOrEqual(
      expectedMinTime
    );

    expect(endTime - startTime).toBeLessThan(10000);
  });

  test("should handle invalid task payload", async () => {
    await request(app).post("/tasks").send({}).expect(400);

    await request(app).post("/tasks").send({ message: null }).expect(400);

    const statsRes = await request(app).get("/statistics").expect(200);
    expect(statsRes.body.tasksProcessed).toBe(0);
    expect(statsRes.body.tasksCompleted).toBe(0);
  });
});
