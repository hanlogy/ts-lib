import { getGlobalConstructor } from '@/utils/globalThis';
import type { FormDataLike } from '../types';

export function isFormData(value: unknown): value is FormDataLike {
  const formDataConstructor = getGlobalConstructor<FormDataLike>('FormData');

  if (formDataConstructor === undefined) {
    return false;
  }

  return value instanceof formDataConstructor;
}

export function isUint8Array(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}

export function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return value instanceof ArrayBuffer;
}
