import { shuffle } from '@/utils/shuffle';

describe('shuffle', () => {
  test('keeps all elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr);
    expect(arr.sort()).toEqual(copy.sort());
  });

  test('changes the order', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr);
    const isDifferent = arr.some((v, i) => v !== copy[i]);
    expect(isDifferent).toBe(true);
  });

  test('works with empty array', () => {
    const arr: number[] = [];
    shuffle(arr);
    expect(arr).toEqual([]);
  });
});
