import { HttpClientError } from './clientErrors';
import { getGlobalConstructor } from '@/utils/globalThis';

export function decodeUtf8(bytes: Uint8Array): string {
  const constructor = getGlobalConstructor<{
    decode(input: Uint8Array): string;
  }>('TextDecoder');
  if (!constructor) {
    throw new HttpClientError(
      'decodeUtf8Error',
      'TextDecoder is not available to decode bytes into text.',
    );
  }

  return new constructor().decode(bytes);
}

export function tryDecodeUtf8(bytes: Uint8Array): string | undefined {
  try {
    return decodeUtf8(bytes);
  } catch {
    return undefined;
  }
}
