import type { HttpHeaders } from '../types';

export function getMediaTypeFromHeaders(
  headers: HttpHeaders,
): string | undefined {
  const item = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === 'content-type',
  );

  if (!item) {
    return undefined;
  }

  return stripContentTypeParameters(item[1]);
}

function stripContentTypeParameters(
  contentTypeHeaderValue?: string,
): string | undefined {
  if (!contentTypeHeaderValue) {
    return undefined;
  }

  const mediaType = contentTypeHeaderValue.split(';')[0]?.trim().toLowerCase();

  return mediaType && mediaType.length > 0 ? mediaType : undefined;
}
