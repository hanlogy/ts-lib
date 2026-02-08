import { ResponseDecodingError } from '../helpers/clientErrors';
import { tryDecodeUtf8 } from '../helpers/decodeUtf8';
import type { TransportBody } from '../types';

export function readTransportBodyText({
  text,
  bytes,
}: TransportBody): string | undefined {
  if (typeof text === 'string') {
    return text;
  }

  if (bytes !== undefined) {
    return tryDecodeUtf8(bytes);
  }

  throw new ResponseDecodingError(
    'Response text is not available for decoding.',
  );
}
