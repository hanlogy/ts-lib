import { BodyEncodingError } from '../helpers/clientErrors';
import type { BodyCodec, EncodedBody, TransportBody } from '../types';
import { readTransportBodyText } from './readTransportBodyText';

/**
 * Request encoding for application/x-www-form-urlencoded.
 */
export const FormUrlEncodedCodec: BodyCodec = {
  supportsMediaType(mediaType: string): boolean {
    return mediaType.toLowerCase() === 'application/x-www-form-urlencoded';
  },

  encode(body: unknown): EncodedBody {
    if (body === null || body === undefined || typeof body !== 'object') {
      throw new BodyEncodingError(
        'FormUrlEncodedCodec expects a plain object body.',
      );
    }

    const record = body as Record<string, unknown>;
    const parts: string[] = [];

    for (const [key, value] of Object.entries(record)) {
      if (value === undefined || value === null) {
        continue;
      }

      const allowed =
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean';

      if (!allowed) {
        throw new BodyEncodingError(
          'FormUrlEncodedCodec only supports string, number, boolean values.',
        );
      }

      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      );
    }

    return {
      body: parts.join('&'),
    };
  },

  decode(body: TransportBody): string | undefined {
    // Keep decoding simple for now (return raw text).
    return readTransportBodyText(body);
  },
};
