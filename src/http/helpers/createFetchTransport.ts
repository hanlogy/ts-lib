import type {
  FetchLike,
  FetchLikeResponse,
  FetchLikeResponseHeaders,
  HttpHeaders,
  HttpTransport,
  TransportBody,
  TransportRequest,
  TransportResponse,
} from '../types';
import { TransportUnavailableError } from './clientErrors';
import { getGlobalFunction } from '@/utils/globalThis';
import { getMediaTypeFromHeaders } from './getMediaTypeFromHeaders';

export function createFetchTransport(
  fetchImplementation?: FetchLike,
): HttpTransport {
  const resolvedFetch =
    fetchImplementation ?? getGlobalFunction<FetchLike>('fetch');

  if (resolvedFetch === undefined) {
    throw new TransportUnavailableError(
      'Fetch transport is not available because globalThis.fetch is missing.',
    );
  }

  return {
    async send(request: TransportRequest): Promise<TransportResponse> {
      const response = await resolvedFetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: request.abortSignal,
      });

      const headers = readResponseHeaders(response.headers);
      const mediaType = getMediaTypeFromHeaders(headers);
      const body = await readResponseBody(response, mediaType);

      return {
        url: response.url || request.url,
        status: response.status,
        headers,
        body,
      };
    },
  };
}

function readResponseHeaders(headers: FetchLikeResponseHeaders): HttpHeaders {
  const result: Record<string, string> = {};

  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value;
  });

  return result;
}

async function readResponseBody(
  response: FetchLikeResponse,
  mediaType?: string,
): Promise<TransportBody> {
  // Missing content-type: read bytes if possible
  if (!mediaType) {
    if (response.arrayBuffer !== undefined) {
      const buffer = await response.arrayBuffer();
      return { bytes: new Uint8Array(buffer) };
    }

    const text = await response.text();
    return { text };
  }

  if (shouldReadAsBytes(mediaType) && response.arrayBuffer !== undefined) {
    const buffer = await response.arrayBuffer();
    return { bytes: new Uint8Array(buffer) };
  }

  const text = await response.text();
  return { text };
}

function shouldReadAsBytes(mediaType: string | undefined): boolean {
  if (
    !mediaType ||
    mediaType.startsWith('text/') ||
    mediaType === 'application/json' ||
    mediaType.endsWith('+json') ||
    mediaType === 'application/x-www-form-urlencoded' ||
    mediaType === 'application/xml' ||
    mediaType.endsWith('+xml')
  ) {
    return false;
  }

  return true;
}
