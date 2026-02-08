import { isEmpty } from '@/utils/isEmpty';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class MyClass {}

describe('isEmpty', () => {
  describe('true', () => {
    test('empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    test('empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    test('empty Set', () => {
      expect(isEmpty(new Set())).toBe(true);
    });

    test('empty Map', () => {
      expect(isEmpty(new Map())).toBe(true);
    });

    test('empty Record', () => {
      expect(isEmpty({})).toBe(true);
    });
  });

  describe('class support', () => {
    test('custom instance', () => {
      expect(isEmpty(new MyClass())).toBe(true);
    });

    test('Error', () => {
      expect(isEmpty(new Error())).toBe(true);
      expect(isEmpty(new Error('foo'))).toBe(false);
    });

    test('RegExp', () => {
      expect(isEmpty(new RegExp(''))).toBe(true);
      expect(isEmpty(/(?:)/)).toBe(true);
      expect(isEmpty(new RegExp('foo'))).toBe(false);
    });
  });

  describe('false', () => {
    test('empty string', () => {
      expect(isEmpty('1')).toBe(false);
    });

    test('empty array', () => {
      expect(isEmpty([1])).toBe(false);
    });

    test('empty Set', () => {
      expect(isEmpty(new Set('foo'))).toBe(false);
    });

    test('empty Map', () => {
      expect(isEmpty(new Map([['key', 'value']]))).toBe(false);
    });

    test('empty Record', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });
  });

  describe('unsupported', () => {
    test('number', () => {
      expect(() => isEmpty(0 as never)).toThrow(TypeError);
    });

    test('function', () => {
      expect(() =>
        isEmpty(function () {
          // Empty
        } as never),
      ).toThrow(TypeError);
    });

    test('NaN', () => {
      expect(() => isEmpty(NaN as never)).toThrow(TypeError);
    });

    test('null', () => {
      expect(() => isEmpty(null as never)).toThrow(TypeError);
    });

    test('undefined', () => {
      expect(() => isEmpty(undefined as never)).toThrow(TypeError);
    });

    test('boolean', () => {
      expect(() => isEmpty(true as never)).toThrow(TypeError);
      expect(() => isEmpty(false as never)).toThrow(TypeError);
    });
  });
});
