import { addTask, getNextTask } from "../taskQueue";
import { stats } from "../stats";

describe("TaskQueue", () => {
  beforeEach(() => {
    stats.reset();
  });

  test("should add and retrieve tasks", () => {
    const taskId = addTask("Test message");
    expect(taskId).toBeDefined();
    expect(typeof taskId).toBe("string");
    const task = getNextTask();
    expect(task?.message).toBe("Test message");
    expect(task?.id).toBe(taskId);
  });

  test("should return undefined for empty queue", () => {
    const task = getNextTask();
    expect(task).toBeUndefined();
  });
});
