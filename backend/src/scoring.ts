/**
 * Scoring logic for the photo quiz.
 *
 * Formula:
 *   - If answer is WRONG: delta = 0
 *   - If answer is CORRECT:
 *       base       = 100 points
 *       speedBonus = floor(MAX_BONUS * (1 - responseTimeMs / questionDurationMs))
 *       delta      = base + speedBonus
 *
 *   responseTimeMs = clamp(serverReceivedAt - questionStartAt, 0, questionDurationMs)
 *   MAX_BONUS      = 50
 *
 * This means:
 *   - Fastest possible answer (0ms): 100 + 50 = 150 points
 *   - Slowest correct answer (at deadline): 100 + 0 = 100 points
 *   - Wrong answer: 0 points
 */

const BASE_SCORE = 100;
const MAX_BONUS = 50;

export function computeScoreDelta(
  isCorrect: boolean,
  responseTimeMs: number,
  questionDurationMs: number
): number {
  if (!isCorrect) return 0;

  const clampedTime = Math.max(0, Math.min(responseTimeMs, questionDurationMs));
  const speedBonus = Math.floor(
    MAX_BONUS * (1 - clampedTime / questionDurationMs)
  );

  return BASE_SCORE + speedBonus;
}

export function isLateAnswer(
  serverReceivedAt: number,
  questionEndAt: number
): boolean {
  return serverReceivedAt > questionEndAt;
}
