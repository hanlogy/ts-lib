import { isArrayBuffer, isUint8Array } from '../helpers/checkTypes';
import {
  BodyEncodingError,
  ResponseDecodingError,
} from '../helpers/clientErrors';
import type { BodyCodec, EncodedBody, TransportBody } from '../types';

/**
 * application/octet-stream support (Uint8Array/ArrayBuffer).
 */
export const OctetStreamCodec: BodyCodec = {
  supportsMediaType(mediaType: string): boolean {
    return mediaType.toLowerCase() === 'application/octet-stream';
  },

  encode(body: unknown): EncodedBody {
    if (isUint8Array(body)) {
      return { body };
    }

    if (isArrayBuffer(body)) {
      return { body };
    }

    throw new BodyEncodingError(
      'OctetStreamCodec requires body to be Uint8Array or ArrayBuffer.',
    );
  },

  decode(body: TransportBody): unknown {
    if (body.bytes !== undefined) {
      return body.bytes;
    }

    throw new ResponseDecodingError(
      'Response bytes are not available for decoding.',
    );
  },
};
