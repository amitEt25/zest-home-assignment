import { logTask, readLogs, clearLogs } from "../logger";

describe("Logger", () => {
  beforeEach(async () => {
    await clearLogs();
  });

  afterEach(async () => {
    await clearLogs();
  });

  test("should write to log file", async () => {
    const workerId = "worker-1";
    const taskId = "task-1";
    const message = "Test message";
    const status = "SUCCESS" as const;

    await logTask(workerId, taskId, message, status);
    const logs = await readLogs();

    expect(logs).toContain(workerId);
    expect(logs).toContain(taskId);
    expect(logs).toContain(message);
    expect(logs).toContain(status);

    expect(logs).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
