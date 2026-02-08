import type { HttpQuery } from '../types';
import { buildQueryString } from './buildQueryString';

function isAbsoluteUrl(url: string): boolean {
  return (
    !!url &&
    (url.startsWith('http://') ||
      url.startsWith('https://') ||
      // Caution:
      // This only works in browsers. In Node.js, a URL without a scheme is not
      // valid. Validate the url before calling this help.
      url.startsWith('//'))
  );
}

export function buildUrl({
  baseUrl,
  url,
  query,
}: {
  baseUrl?: string;
  url?: string;
  query?: HttpQuery;
} = {}): string {
  let mergedUrl: string;

  if (url && isAbsoluteUrl(url)) {
    mergedUrl = url;
  } else {
    baseUrl = baseUrl?.replace(/\/+$/, '/');
    url = url?.replace(/^\/*/, '');
    mergedUrl = [baseUrl, url]
      .filter(Boolean)
      .join(baseUrl?.endsWith('/') ? '' : '/');
  }

  const [path = '', existingQueryString] = mergedUrl.split('?', 2);
  const fullQuery = [existingQueryString, buildQueryString(query)]
    .filter(Boolean)
    .join('&');

  return fullQuery ? `${path}?${fullQuery}` : path;
}
