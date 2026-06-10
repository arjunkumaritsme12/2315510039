/**
 * Priority scoring utility for Stage 6 & 7
 * Score = typeWeight * e^(-λ * hoursElapsed)
 */

const TYPE_WEIGHTS = { Placement: 3, Result: 2, Event: 1 };
const DECAY_LAMBDA = 0.1;

export function calculatePriorityScore(notification) {
  const typeWeight = TYPE_WEIGHTS[notification.Type] || 1;
  const createdAt = new Date(notification.Timestamp);
  const hoursElapsed = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const recencyFactor = Math.exp(-DECAY_LAMBDA * hoursElapsed);
  return typeWeight * recencyFactor;
}

export function getTopNPriority(notifications, n = 10) {
  return [...notifications]
    .map((notif) => ({ ...notif, _score: calculatePriorityScore(notif) }))
    .sort((a, b) => b._score - a._score)
    .slice(0, n);
}
