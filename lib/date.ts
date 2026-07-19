const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function toUtcMidnight(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export function addDays(date: Date, amount: number) {
  return new Date(date.getTime() + amount * MILLISECONDS_PER_DAY);
}

export function getWeekStart(date: Date) {
  const normalized = toUtcMidnight(date);
  const daysSinceMonday = (normalized.getUTCDay() + 6) % 7;

  return addDays(normalized, -daysSinceMonday);
}

export function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
