type EmptyCheckable =
  | string
  | unknown[]
  | readonly unknown[]
  | Record<string | number | symbol, unknown>
  | Map<unknown, unknown>
  | Set<unknown>
  | object;

export function isEmpty(value: EmptyCheckable): boolean {
  if (typeof value === 'string') {
    return value.length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }

  if (typeof value === 'object') {
    if (value instanceof Error) {
      return value.message === '';
    }
    if (value instanceof RegExp) {
      return value.source.length === 0 || value.source === '(?:)';
    }

    return Object.keys(value).length === 0;
  }

  throw new TypeError(
    `Unsupported type for isEmpty(), value: ${String(value)}`,
  );
}
