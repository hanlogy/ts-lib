import { DateInput } from '@/types';
import { toDate } from '@/utils/date';

export const fakeSystemTime = (time: DateInput): void => {
  jest.useFakeTimers().setSystemTime(toDate(time));
};
