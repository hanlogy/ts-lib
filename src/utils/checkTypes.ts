import type { JsonRecord, JsonValue, PrimitiveValue } from '../types';

export function isPrimitive(value: unknown): value is PrimitiveValue {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

/**
 * Checks if a value is a plain object (not an array, not null).
 */
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const proto = Reflect.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function isJsonValue(value: unknown): value is JsonValue {
  return isPrimitive(value) || isJsonArray(value) || isJsonRecord(value);
}

export function isJsonRecord(value?: unknown): value is JsonRecord {
  return isPlainObject(value) && Object.values(value).every(isJsonValue);
}

export function isJsonArray(value?: unknown): value is JsonValue[] {
  return Array.isArray(value) && value.every(isJsonValue);
}
