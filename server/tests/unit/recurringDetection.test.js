import { describe, it, expect } from 'vitest';
import { detectSpike } from '../../src/services/recurringDetection.js';

describe('detectSpike', () => {
  it('does not flag a spike below the threshold', () => {
    const result = detectSpike(5, 60, 10);
    expect(result.isSpike).toBe(false);
    expect(result.rate).toBe(5);
  });

  it('flags a spike at or above the threshold', () => {
    const result = detectSpike(10, 60, 10);
    expect(result.isSpike).toBe(true);
  });

  it('computes an hourly rate for windows shorter than an hour', () => {
    const result = detectSpike(50, 10, 10); // 50 occurrences in 10 minutes = 300/hr
    expect(result.rate).toBe(300);
    expect(result.isSpike).toBe(true);
  });

  it('handles zero occurrences', () => {
    const result = detectSpike(0, 60, 10);
    expect(result.isSpike).toBe(false);
    expect(result.rate).toBe(0);
  });
});
