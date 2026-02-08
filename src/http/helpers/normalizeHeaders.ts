import type { HttpHeaders } from '../types';

export function normalizeHeaders(headers?: HttpHeaders): HttpHeaders {
  if (headers === undefined) {
    return {};
  }
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    result[key.toLowerCase()] = value;
  }

  return result;
}
