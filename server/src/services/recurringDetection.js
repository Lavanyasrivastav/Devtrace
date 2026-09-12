// Given how many times an error occurred within a recent time window, decide
// whether it qualifies as "recurring"/spiking, and at what hourly rate.
// Kept as a pure function (no DB access) so it's trivially unit-testable —
// the worker is just responsible for fetching occurrenceCountInWindow and
// persisting the result.
export function detectSpike(occurrenceCountInWindow, windowMinutes = 60, spikeThreshold = 10) {
  const ratePerHour = Math.round((occurrenceCountInWindow / windowMinutes) * 60 * 100) / 100;
  const isSpike = occurrenceCountInWindow >= spikeThreshold;
  return { isSpike, rate: ratePerHour };
}
