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
});
