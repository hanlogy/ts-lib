import { isFormData } from '../helpers/checkTypes';
import { BodyEncodingError } from '../helpers/clientErrors';
import type { BodyCodec, EncodedBody, TransportBody } from '../types';
import { readTransportBodyText } from './readTransportBodyText';

/**
 * Request pass-through for multipart/form-data when FormData exists.
 */
export const FormDataCodec: BodyCodec = {
  supportsMediaType(mediaType: string): boolean {
    return mediaType.toLowerCase() === 'multipart/form-data';
  },

  encode(body: unknown): EncodedBody {
    if (!isFormData(body)) {
      throw new BodyEncodingError(
        'FormDataCodec requires body to be a FormData instance in this environment.',
      );
    }

    return { body };
  },

  decode(body: TransportBody): string | undefined {
    // Keep decoding simple for now (return raw text).
    return readTransportBodyText(body);
  },
};
