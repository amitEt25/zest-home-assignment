import { enqueueTask } from "../workerManager";
import { stats } from "../stats";

describe("workerManager", () => {
  beforeEach(() => {
    stats.reset();
  });

  async function waitForProcessed(count: number, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (stats.getStats().tasksProcessed >= count) return;
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error("Timeout waiting for tasks to process");
  }

  test("should process a task", async () => {
    enqueueTask({ id: "test-task", message: "test message" });
    await waitForProcessed(1);

    const s = stats.getStats();
    expect(s.tasksProcessed).toBe(1);
  });
});
