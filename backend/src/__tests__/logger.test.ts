import { logTask, readLogs, clearLogs } from "../logger";

describe("Logger", () => {
  beforeEach(async () => {
    await clearLogs();
  });

  afterEach(async () => {
    await clearLogs();
  });

  test("should log and read a task entry", async () => {
    const workerId = "worker-1";
    const taskId = "task-1";
    const message = "Test task message";
    const status = "SUCCESS" as const;

    await logTask(workerId, taskId, message, status);
    const logs = await readLogs();
    expect(logs).toContain(workerId);
    expect(logs).toContain(taskId);
    expect(logs).toContain(message);
    expect(logs).toContain(status);
    expect(logs).toMatch(
      /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z/
    );
    const lines = logs.split("\n");
    const [timestamp] = lines[0].split(" | ");
    expect(new Date(timestamp).toString()).not.toBe("Invalid Date");
  });
});
