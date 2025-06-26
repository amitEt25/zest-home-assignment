import { enqueueTask } from "../workerManager";
import { stats } from "../stats";

describe("workerManager", () => {
  beforeEach(() => {
    stats.reset();
  });

  async function waitForProcessed(count: number, timeout = 3000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (stats.getStats().tasksProcessed >= count) return;
      await new Promise((r) => setTimeout(r, 50));
    }
    throw new Error("Timeout waiting for tasks to process");
  }

  test("should process a task successfully", async () => {
    enqueueTask({ id: "success-task", message: "do something" });
    await waitForProcessed(1);
    const s = stats.getStats();
    expect(s.succeeded).toBe(1);
    expect(s.failed).toBe(0);
  });

  test("should handle task failure", async () => {
    enqueueTask({ id: "fail-task", message: "fail" });
    await waitForProcessed(1);
    const s = stats.getStats();
    expect(s.failed).toBe(1);
    expect(s.succeeded).toBe(0);
  });
});
