import request from "supertest";
import { app } from "../server";
import { stats } from "../stats";
import { readLogs, clearLogs } from "../logger";

describe("integration", () => {
  beforeEach(async () => {
    stats.reset();
    await clearLogs();
  });

  test("should enqueue a task and process it", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ message: "integration test" })
      .expect(200);
    expect(res.body).toHaveProperty("taskId");
    await new Promise((r) => setTimeout(r, 500));
    const s = stats.getStats();
    expect(s.tasksProcessed).toBeGreaterThan(0);
    const logs = await readLogs();
    expect(logs).toContain("integration test");
  });

  test("should handle multiple tasks", async () => {
    const taskPromises = [];
    const numTasks = 3;

    for (let i = 0; i < numTasks; i++) {
      taskPromises.push(
        request(app)
          .post("/tasks")
          .send({ message: `task ${i}` })
          .expect(200)
      );
    }

    const responses = await Promise.all(taskPromises);

    const taskIds = responses.map((r) => r.body.taskId);
    expect(taskIds.length).toBe(numTasks);

    await new Promise((r) => setTimeout(r, 2000));

    const statsRes = await request(app).get("/statistics").expect(200);

    expect(statsRes.body.tasksProcessed).toBeGreaterThan(0);
    expect(statsRes.body.tasksProcessed).toBeLessThanOrEqual(numTasks);

    if (statsRes.body.avgProcessingTime > 0) {
      expect(statsRes.body.avgProcessingTime).toBeGreaterThan(100);
    }
  });

  test("should handle task failures gracefully", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ message: "test failure" })
      .expect(200);

    expect(res.body.taskId).toBeDefined();

    await new Promise((r) => setTimeout(r, 1500));

    const statsRes = await request(app).get("/statistics").expect(200);

    expect(statsRes.body.tasksProcessed).toBe(1);

    expect(statsRes.body.succeeded + statsRes.body.failed).toBe(1);
  });
});
