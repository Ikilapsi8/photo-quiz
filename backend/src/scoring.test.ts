import { describe, it, expect } from "vitest";
import { computeScoreDelta, isLateAnswer } from "./scoring";

describe("computeScoreDelta", () => {
  const duration = 10_000; // 10 seconds

  it("returns 0 for incorrect answer", () => {
    expect(computeScoreDelta(false, 0, duration)).toBe(0);
    expect(computeScoreDelta(false, 5000, duration)).toBe(0);
    expect(computeScoreDelta(false, 10000, duration)).toBe(0);
  });

  it("returns 150 (100 base + 50 bonus) for instant correct answer", () => {
    expect(computeScoreDelta(true, 0, duration)).toBe(150);
  });

  it("returns 100 (100 base + 0 bonus) for correct answer at deadline", () => {
    expect(computeScoreDelta(true, 10000, duration)).toBe(100);
  });

  it("returns correct score for mid-range response time", () => {
    // At 5000ms: speedBonus = floor(50 * (1 - 5000/10000)) = floor(50 * 0.5) = 25
    expect(computeScoreDelta(true, 5000, duration)).toBe(125);
  });

  it("returns correct score for 2000ms response time", () => {
    // At 2000ms: speedBonus = floor(50 * (1 - 2000/10000)) = floor(50 * 0.8) = 40
    expect(computeScoreDelta(true, 2000, duration)).toBe(140);
  });

  it("clamps negative responseTimeMs to 0", () => {
    // Negative time should be treated as 0 (instant)
    expect(computeScoreDelta(true, -100, duration)).toBe(150);
  });

  it("clamps responseTimeMs exceeding duration", () => {
    // Over-duration should be treated as exactly at deadline
    expect(computeScoreDelta(true, 15000, duration)).toBe(100);
  });
});

describe("isLateAnswer", () => {
  it("returns false when answer is within time", () => {
    const questionEndAt = 1000;
    expect(isLateAnswer(999, questionEndAt)).toBe(false);
    expect(isLateAnswer(1000, questionEndAt)).toBe(false);
  });

  it("returns true when answer is after deadline", () => {
    const questionEndAt = 1000;
    expect(isLateAnswer(1001, questionEndAt)).toBe(true);
    expect(isLateAnswer(2000, questionEndAt)).toBe(true);
  });
});
