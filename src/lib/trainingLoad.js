import { isoWeekKey, lastNWeekKeys } from './date.js';

export function weeklyMinutes(tours) {
  const totals = {};
  for (const t of tours) {
    const key = isoWeekKey(t.date);
    totals[key] = (totals[key] ?? 0) + (Number(t.durationMin) || 0);
  }
  return totals;
}

// Compares this week's training minutes to the average of the previous
// (fully logged) weeks, as a rough overuse/overtraining signal.
export function overtrainingStatus(tours) {
  const weekKeys = lastNWeekKeys(4);
  const totals = weeklyMinutes(tours);
  const currentKey = weekKeys[weekKeys.length - 1];
  const previousKeys = weekKeys.slice(0, -1);

  const currentMinutes = totals[currentKey] ?? 0;
  const previousValues = previousKeys.map((k) => totals[k] ?? 0).filter((v) => v > 0);

  if (previousValues.length < 2) {
    return { level: 'unknown', currentMinutes, avgPreviousMinutes: 0 };
  }

  const avgPreviousMinutes =
    previousValues.reduce((sum, v) => sum + v, 0) / previousValues.length;
  const ratio = avgPreviousMinutes > 0 ? currentMinutes / avgPreviousMinutes : 0;

  return {
    level: ratio >= 1.3 ? 'warning' : 'good',
    currentMinutes,
    avgPreviousMinutes: Math.round(avgPreviousMinutes),
  };
}
