export function todayStr() {
  return dateToStr(new Date());
}

export function dateToStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function lastNDays(n) {
  const days = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(dateToStr(d));
  }
  return days;
}

const WEEKDAYS_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export function weekdayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return WEEKDAYS_DE[d.getDay()];
}

export function shortLabel(dateStr) {
  const [, m, d] = dateStr.split('-');
  return `${d}.${m}.`;
}

// ISO-8601 week number (weeks start on Monday, week 1 contains the year's first Thursday).
export function isoWeekInfo(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target - firstThursday;
  const week = 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  return { year: target.getFullYear(), week };
}

export function isoWeekKey(dateStr) {
  const { year, week } = isoWeekInfo(dateStr);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export function lastNWeekKeys(n) {
  const keys = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);
    keys.push(isoWeekKey(dateToStr(d)));
  }
  return [...new Set(keys)];
}
