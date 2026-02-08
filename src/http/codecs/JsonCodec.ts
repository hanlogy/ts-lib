import type { JsonValue } from '@/types';
import {
  BodyEncodingError,
  ResponseDecodingError,
} from '../helpers/clientErrors';
import type { BodyCodec, EncodedBody, TransportBody } from '../types';
import { readTransportBodyText } from './readTransportBodyText';

/**
 * Supports application/json and also vendor +json types
 * (application/problem+json, etc.).
 */
export const JsonCodec: BodyCodec = {
  supportsMediaType(mediaType: string): boolean {
    const lower = mediaType.toLowerCase();
    return lower === 'application/json' || lower.endsWith('+json');
  },

  encode(body: unknown): EncodedBody {
    if (typeof body === 'string') {
      return { body };
    }

    try {
      const jsonText = JSON.stringify(body);
      return { body: jsonText };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown JSON stringify error';
      throw new BodyEncodingError(
        `Failed to encode JSON request body: ${message}`,
      );
    }
  },

  decode(body: TransportBody): JsonValue | undefined {
    const text = readTransportBodyText(body)?.trim();

    if (!text) {
      return undefined;
    }

    try {
      return JSON.parse(text) as JsonValue;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown JSON parse error';
      throw new ResponseDecodingError(
        `Failed to parse JSON response: ${message}`,
      );
    }
  },
};
