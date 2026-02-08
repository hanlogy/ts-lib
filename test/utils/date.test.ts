import {
  compareDates,
  isDateEqual,
  isFuture,
  isNotFuture,
  isNotPast,
  isPast,
  shiftDate,
} from '@/utils/date';

describe('date', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('compareDates', () => {
    test('0', () => {
      const date1 = '2025-08-15';
      const date2 = '2025-08-15T00:00:00';

      expect(compareDates(date1, date2)).toBe(0);
      expect(isDateEqual(date1, date2)).toBe(true);
      expect(isFuture(date1, date2)).toBe(false);
      expect(isPast(date1, date2)).toBe(false);
      expect(isNotFuture(date1, date2)).toBe(true);
      expect(isNotPast(date1, date2)).toBe(true);
    });

    test('1', () => {
      const date1 = '2025-08-16';
      const date2 = '2025-08-15T00:00:00';

      expect(compareDates(date1, date2)).toBe(1);
      expect(isDateEqual(date1, date2)).toBe(false);
      expect(isFuture(date1, date2)).toBe(true);
      expect(isPast(date1, date2)).toBe(false);
      expect(isNotFuture(date1, date2)).toBe(false);
      expect(isNotPast(date1, date2)).toBe(true);
    });

    test('-1', () => {
      const date1 = '2025-08-10';
      const date2 = '2025-08-15T00:00:00';

      expect(compareDates(date1, date2)).toBe(-1);
      expect(isDateEqual(date1, date2)).toBe(false);
      expect(isFuture(date1, date2)).toBe(false);
      expect(isPast(date1, date2)).toBe(true);
      expect(isNotFuture(date1, date2)).toBe(true);
      expect(isNotPast(date1, date2)).toBe(false);
    });
  });

  describe('shiftDate', () => {
    test('use current time', () => {
      jest.useFakeTimers().setSystemTime(new Date('2025-08-15T12:00:00.000Z'));
      expect(
        shiftDate({
          years: -1,
          months: 1,
          days: 1,
          hours: 1,
          minutes: 1,
          seconds: 1,
          milliseconds: 1,
        }).toISOString(),
      ).toBe('2024-09-16T13:01:01.001Z');
    });

    test('from specific time', () => {
      expect(
        shiftDate('2024-08-15T12:00:00.000Z', {
          years: -1,
          months: 1,
          days: 1,
          hours: 1,
          minutes: 1,
          seconds: 1,
          milliseconds: 1,
        }).toISOString(),
      ).toBe('2023-09-16T13:01:01.001Z');
    });
  });
});
