import type { DateInput } from '@/types';

export function isValidDate(date: DateInput): boolean {
  return !isNaN((date instanceof Date ? date : new Date(date)).getTime());
}

export function toDate(date: DateInput): Date {
  if (date instanceof Date) {
    return date;
  }

  let resolvedDate = new Date(date);
  if (isValidDate(resolvedDate)) {
    return resolvedDate;
  }

  if (typeof date === 'string') {
    resolvedDate = new Date(date.trim().replace(/\s+/, 'T'));
    if (isValidDate(resolvedDate)) {
      return resolvedDate;
    }
  }

  throw new Error('Invalid date input');
}

export function toUtc(date?: DateInput): string {
  return (date ? toDate(date) : new Date()).toISOString();
}

export function toTime(date: DateInput): number {
  return toDate(date).getTime();
}

// --- Date comparison ---
export function compareDates(date1: DateInput, date2: DateInput): number {
  const time1 = toTime(date1);
  const time2 = toTime(date2);

  return time1 === time2 ? 0 : time1 > time2 ? 1 : -1;
}

export function isDateEqual(
  date: DateInput,
  now: DateInput = new Date(),
): boolean {
  return compareDates(date, now) === 0;
}

/**
 * `date` is in the future of `now`.
 */
export function isFuture(
  date: DateInput,
  now: DateInput = new Date(),
): boolean {
  return compareDates(date, now) === 1;
}

export function isPast(date: DateInput, now: DateInput = new Date()): boolean {
  return compareDates(date, now) === -1;
}

/**
 * Now and thre future
 */
export function isNotPast(
  date: DateInput,
  now: DateInput = new Date(),
): boolean {
  return compareDates(date, now) !== -1;
}

/**
 * Now and the past
 */
export function isNotFuture(
  date: DateInput,
  now: DateInput = new Date(),
): boolean {
  return compareDates(date, now) !== 1;
}

// --- shiftDate ---
interface ShiftOptions {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}
export function shiftDate(
  arg1?: DateInput | Partial<ShiftOptions>,
  arg2?: Partial<ShiftOptions>,
): Date {
  let current: DateInput | undefined;
  let shift: Partial<ShiftOptions> = {};

  if (
    arg1 instanceof Date ||
    typeof arg1 === 'string' ||
    typeof arg1 === 'number'
  ) {
    current = arg1;
    shift = arg2 ?? {};
  } else {
    shift = arg1 ?? {};
  }

  const result = current ? new Date(current) : new Date();
  const {
    years = 0,
    months = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0,
  } = shift;

  if (years) {
    result.setFullYear(result.getFullYear() + years);
  }
  if (months) {
    result.setMonth(result.getMonth() + months);
  }
  if (days) {
    result.setDate(result.getDate() + days);
  }
  if (hours) {
    result.setHours(result.getHours() + hours);
  }
  if (minutes) {
    result.setMinutes(result.getMinutes() + minutes);
  }
  if (seconds) {
    result.setSeconds(result.getSeconds() + seconds);
  }
  if (milliseconds) {
    result.setMilliseconds(result.getMilliseconds() + milliseconds);
  }

  return result;
}
