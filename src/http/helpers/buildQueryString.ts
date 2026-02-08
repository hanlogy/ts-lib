import type { HttpQuery } from '../types';

export function buildQueryString(query?: HttpQuery): string {
  if (query === undefined) {
    return '';
  }
  const parts: string[] = [];

  const push = (key: string, value: string): void => {
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  };

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      // TS does not narrow readonly arrays with Array.isArray
      // https://github.com/microsoft/TypeScript/issues/17002
      const values = value as readonly string[];
      for (const e of values) {
        push(key, e);
      }
    } else {
      // TS does not narrow readonly arrays with Array.isArray
      // https://github.com/microsoft/TypeScript/issues/17002
      push(key, value as string);
    }
  }

  return parts.length > 0 ? parts.join('&') : '';
}
