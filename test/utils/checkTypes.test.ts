import { isJsonRecord, isPrimitive } from '@/utils/checkTypes';

describe('isPrimitive', () => {
  test('true', () => {
    expect(isPrimitive(null)).toBe(true);
    expect(isPrimitive(false)).toBe(true);
    expect(isPrimitive(0)).toBe(true);
    expect(isPrimitive('')).toBe(true);
    expect(isPrimitive('string')).toBe(true);
    expect(isPrimitive(-1.5)).toBe(true);
  });

  test('false', () => {
    expect(isPrimitive(undefined)).toBe(false);
    expect(
      isPrimitive(() => {
        //
      }),
    ).toBe(false);
    expect(isPrimitive({})).toBe(false);
    expect(isPrimitive([1])).toBe(false);
  });
});

describe('isJsonRecord', () => {
  test('undefined and primitives', () => {
    expect(isJsonRecord()).toBe(false);
    expect(isJsonRecord(null)).toBe(false);
    expect(isJsonRecord(true)).toBe(false);
    expect(isJsonRecord(false)).toBe(false);
    expect(isJsonRecord(1)).toBe(false);
    expect(isJsonRecord('hello')).toBe(false);
    expect(isJsonRecord({ key: undefined })).toBe(false);
    expect(
      isJsonRecord({
        key: () => {
          //
        },
      }),
    ).toBe(false);
    expect(isJsonRecord({ key: Symbol() })).toBe(false);
  });

  test('nested valid structures', () => {
    expect(isJsonRecord({ a: { b: { c: 1 } } })).toBe(true);
    expect(isJsonRecord({ list: [1, 2, { nested: true }] })).toBe(true);
  });

  test('empty {}', () => {
    expect(isJsonRecord({})).toBe(true);
  });

  test('others', () => {
    expect(isJsonRecord({ key: new Date() })).toBe(false);
  });
});
