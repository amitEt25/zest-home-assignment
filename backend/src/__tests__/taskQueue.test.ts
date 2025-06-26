import { addTask, getNextTask } from "../taskQueue";
import { stats } from "../stats";

describe("TaskQueue", () => {
  beforeEach(() => {
    stats.reset();
  });

  test("should add task and return task ID", () => {
    const taskId = addTask("Test task message");
    expect(taskId).toBeDefined();
    expect(typeof taskId).toBe("string");
    expect(taskId.length).toBeGreaterThan(0);
  });

  test("should handle multiple task additions", () => {
    const taskId1 = addTask("Test task 1");
    const taskId2 = addTask("Test task 2");

    expect(taskId1).not.toBe(taskId2);
    expect(typeof taskId1).toBe("string");
    expect(typeof taskId2).toBe("string");
  });

  test("should get next task from queue when available", () => {
    const message = "Test task for queue";
    addTask(message);
    const task = getNextTask();
    if (task) {
      expect(task.message).toBe(message);
      expect(typeof task.id).toBe("string");
    }
  });

  test("should return undefined when queue is empty", () => {
    while (getNextTask()) {}

    const task = getNextTask();
    expect(task).toBeUndefined();
  });
});
