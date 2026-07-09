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
