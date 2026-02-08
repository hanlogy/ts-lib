import type { BodyCodec } from '../types';
import { FormDataCodec } from './FormDataCodec';
import { FormUrlEncodedCodec } from './FormUrlEncodedCodec';
import { JsonCodec } from './JsonCodec';
import { OctetStreamCodec } from './OctetStreamCodec';
import { TextCodec } from './TextCodec';

export function findCodec(
  codecs: readonly BodyCodec[],
  mediaType: string,
): BodyCodec | undefined {
  for (const codec of codecs) {
    if (codec.supportsMediaType(mediaType)) {
      return codec;
    }
  }
  return undefined;
}

export function getDefaultCodecs(): BodyCodec[] {
  return [
    JsonCodec,
    TextCodec,
    FormUrlEncodedCodec,
    FormDataCodec,
    OctetStreamCodec,
  ];
}
