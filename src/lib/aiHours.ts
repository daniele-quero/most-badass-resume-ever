const AI_CONTACT_DATE = new Date(2026, 2, 1);
const VACATION_DAYS_PER_YEAR = 20;
const DAYS_PER_YEAR = 365;
const HOURS_PER_WORKDAY = 6;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type AiHoursBreakdown = {
  spanDays: number;
  workingDays: number;
  vacationDays: number;
  effectiveDays: number;
  hours: number;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function countWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    if (!isWeekend(cursor)) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function computeAiHours(now: Date = new Date()): AiHoursBreakdown {
  const start = startOfDay(AI_CONTACT_DATE);
  const end = startOfDay(now);
  end.setDate(end.getDate() - 1);

  if (end < start) {
    return { spanDays: 0, workingDays: 0, vacationDays: 0, effectiveDays: 0, hours: 0 };
  }

  const spanDays = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
  const workingDays = countWorkingDays(start, end);
  const vacationDays = Math.round((VACATION_DAYS_PER_YEAR * spanDays) / DAYS_PER_YEAR);
  const effectiveDays = Math.max(workingDays - vacationDays, 0);
  const hours = effectiveDays * HOURS_PER_WORKDAY;

  return { spanDays, workingDays, vacationDays, effectiveDays, hours };
}
