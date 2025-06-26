import { stats } from '../stats';

describe('Stats', () => {
  beforeEach(() => {
    stats.reset();
  });

  test('should track success, failure, retry, and processing time', () => {
    stats.incrementProcessed();
    stats.incrementSuccess();
    stats.incrementFailure();
    stats.incrementRetry();
    stats.addProcessingTime(100);
    const s = stats.getStats();
    expect(s.succeeded).toBe(1);
    expect(s.failed).toBe(1);
    expect(s.taskRetries).toBe(1);
    expect(s.avgProcessingTime).toBe(100);
  });
}); 