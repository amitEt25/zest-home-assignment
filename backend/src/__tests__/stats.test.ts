import { stats } from "../stats";

describe("Stats", () => {
  beforeEach(() => {
    stats.reset();
  });

  test("should track basic statistics", () => {
    stats.incrementProcessed();
    stats.incrementSuccess();
    stats.addProcessingTime(100);
    const s = stats.getStats();
    expect(s.succeeded).toBe(1);
    expect(s.tasksProcessed).toBe(1);
    expect(s.avgProcessingTime).toBe(100);
  });

  test("should calculate average correctly", () => {
    stats.incrementProcessed();
    stats.addProcessingTime(100);
    stats.incrementProcessed();
    stats.addProcessingTime(200);

    const s = stats.getStats();
    expect(s.avgProcessingTime).toBe(150); // (100+200)/2
  });

  test("should handle empty stats", () => {
    const s = stats.getStats();
    expect(s.avgProcessingTime).toBe(0);
    expect(s.tasksProcessed).toBe(0);
  });
});
