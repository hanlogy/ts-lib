import { BodyEncodingError } from '../helpers/clientErrors';
import type { BodyCodec, EncodedBody, TransportBody } from '../types';
import { readTransportBodyText } from './readTransportBodyText';

/**
 * Supports all text/* responses and request text/plain.
 */
export const TextCodec: BodyCodec = {
  supportsMediaType(mediaType: string): boolean {
    const lower = mediaType.toLowerCase();
    return lower.startsWith('text/') || lower === 'text/plain';
  },

  encode(body: unknown): EncodedBody {
    if (typeof body !== 'string') {
      throw new BodyEncodingError('TextCodec can only encode string bodies.');
    }
    return { body };
  },

  decode(body: TransportBody): string | undefined {
    return readTransportBodyText(body);
  },
};
