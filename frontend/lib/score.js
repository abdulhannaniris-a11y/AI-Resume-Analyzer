/**
 * Shared helper for mapping a 0-100 score to a semantic color band.
 * Used by both ScoreRing and ScoreBar so bands stay consistent.
 */
export function scoreColor(score) {
  if (score >= 75) return { text: "text-signal-700", bg: "bg-signal-600", soft: "bg-signal-50" };
  if (score >= 50) return { text: "text-amber", bg: "bg-amber", soft: "bg-amber-50" };
  return { text: "text-clay", bg: "bg-clay", soft: "bg-clay-50" };
}

export function scoreLabel(score) {
  if (score >= 75) return "Strong match";
  if (score >= 50) return "Partial match";
  return "Needs work";
}
