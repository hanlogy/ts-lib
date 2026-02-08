import type { TransportBody } from '../types';
import { tryDecodeUtf8 } from './decodeUtf8';

function containsNullByte(bytes: Uint8Array): boolean {
  for (const byte of bytes) {
    if (byte === 0) {
      return true;
    }
  }
  return false;
}

export function guessBodyWhenContentTypeMissing(body: TransportBody): unknown {
  // Prefer existing text if transport provided it
  if (typeof body.text === 'string') {
    const trimmed = body.text.trim();
    if (trimmed.length === 0) {
      return undefined;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return body.text;
    }
  }

  if (body.bytes === undefined) {
    return undefined;
  }

  // Minimal binary guard: null bytes usually indicate binary
  if (containsNullByte(body.bytes)) {
    return body.bytes;
  }

  const decoded = tryDecodeUtf8(body.bytes);
  if (decoded === undefined) {
    return body.bytes;
  }

  // Minimal "bad decode" guard:
  // replacement character often indicates invalid UTF-8/binary
  if (decoded.includes('\uFFFD')) {
    return body.bytes;
  }

  const trimmed = decoded.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return decoded;
  }
}
