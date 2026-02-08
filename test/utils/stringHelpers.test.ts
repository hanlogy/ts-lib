import { camelToKebab, kebabToCamel } from '@/utils/stringHelpers';

describe('stringHelpers', () => {
  describe('camelToKebab', () => {
    test('zero', () => {
      expect(camelToKebab('abc')).toBe('abc');
    });

    test('one', () => {
      expect(camelToKebab('abcDef')).toBe('abc-def');
    });

    test('two', () => {
      expect(camelToKebab('abcDefGhi')).toBe('abc-def-ghi');
    });
  });

  describe('kebabToCamel', () => {
    test('zero', () => {
      expect(kebabToCamel('abc')).toBe('abc');
    });

    test('one', () => {
      expect(kebabToCamel('abc-def')).toBe('abcDef');
    });

    test('two', () => {
      expect(kebabToCamel('abc-def-ghi')).toBe('abcDefGhi');
    });
  });
});
