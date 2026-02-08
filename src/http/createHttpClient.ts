import { findCodec, getDefaultCodecs } from './codecs/codecs';
import { buildUrl } from './helpers/buildUrl';
import { isArrayBuffer, isFormData, isUint8Array } from './helpers/checkTypes';
import {
  RequestAbortedError,
  RequestTimeoutError,
  UnsupportedContentTypeError,
} from './helpers/clientErrors';
import { composeMiddlewares } from './helpers/composeMiddlewares';
import { createAbortSetup } from './helpers/createAbortSetup';
import { createFetchTransport } from './helpers/createFetchTransport';
import { getMediaTypeFromHeaders } from './helpers/getMediaTypeFromHeaders';
import { guessBodyWhenContentTypeMissing } from './helpers/guessBodyWhenContentTypeMissing';
import { normalizeHeaders } from './helpers/normalizeHeaders';
import type {
  AbortSignalLike,
  HttpClient,
  HttpClientConfiguration,
  HttpMethodRequest,
  HttpRequest,
  HttpResponse,
  TransportBodyInit,
} from './types';

export function createHttpClient({
  baseUrl = '',
  middlewares = [],
  headers: defaultHeaders = {},
  timeoutMs: defaultTimeoutMs,
  codecs: customCodecs = [],
  transport: customTransport,
}: HttpClientConfiguration = {}): HttpClient {
  const transport = customTransport ?? createFetchTransport();
  const codecs = [...getDefaultCodecs(), ...customCodecs];

  async function sendRequest<TBody>(
    request: HttpRequest,
  ): Promise<HttpResponse<TBody>> {
    const url = buildUrl({ baseUrl, url: request.url, query: request.query });

    // Normalize and mergeHeaders
    const headers = {
      ...normalizeHeaders(defaultHeaders),
      ...normalizeHeaders(request.headers),
    };
    const effectiveTimeoutMs = request.timeoutMs ?? defaultTimeoutMs;

    const abortSetup = createAbortSetup({
      upstreamAbortSignal: request.abortSignal,
      timeoutMs: effectiveTimeoutMs,
    });

    // ensure abort timers/listeners are cleaned up exactly once
    let didCleanup = false;
    const cleanup = (): void => {
      if (didCleanup) {
        return;
      }
      didCleanup = true;
      abortSetup.cleanup();
    };

    // If already aborted before send, fail fast.
    if (isAbortSignalAborted(request.abortSignal)) {
      cleanup();
      throw new RequestAbortedError('Request was aborted before it was sent.');
    }

    try {
      const requestHasBody = request.body !== undefined;
      let transportBody: TransportBodyInit | undefined;

      if (requestHasBody) {
        const mediaType = getMediaTypeFromHeaders(headers);
        if (mediaType) {
          const codec = findCodec(codecs, mediaType);
          if (codec === undefined) {
            cleanup();
            throw new UnsupportedContentTypeError('request', mediaType);
          }

          transportBody = codec.encode(request.body).body;
        } else {
          // Only allow passing through an already-encoded transport body.
          if (!isTransportBodyInit(request.body)) {
            cleanup();
            throw new UnsupportedContentTypeError(
              'request',
              '(missing content-type)',
            );
          }
          transportBody = request.body;
        }
      }

      const transportResponse = await transport.send({
        method: request.method,
        url,
        headers,
        body: transportBody,
        abortSignal: abortSetup.abortSignalForTransport,
      });

      const responseMediaType = getMediaTypeFromHeaders(
        transportResponse.headers,
      );

      let decodedBody: unknown;

      if (!responseMediaType) {
        decodedBody = guessBodyWhenContentTypeMissing(transportResponse.body);
      } else {
        const codec = findCodec(codecs, responseMediaType);

        if (!codec) {
          throw new UnsupportedContentTypeError('response', responseMediaType);
        }

        decodedBody = codec.decode(transportResponse.body, responseMediaType);
      }

      return {
        url: transportResponse.url,
        status: transportResponse.status,
        headers: transportResponse.headers,
        body: decodedBody as TBody,
      };
    } catch (error) {
      // Normalize abort/timeout errors across environments
      if (abortSetup.abortSignalForTransport?.aborted === true) {
        if (abortSetup.didTimeout) {
          const timeoutMs = effectiveTimeoutMs ?? 0;
          throw new RequestTimeoutError(
            timeoutMs,
            `Request timed out after ${timeoutMs}ms.`,
          );
        }

        throw new RequestAbortedError('Request was aborted.');
      }

      throw error;
    } finally {
      cleanup();
    }
  }

  const handler = composeMiddlewares(middlewares, (request) =>
    sendRequest<unknown>(request),
  );

  return {
    async request<TBody>(request: HttpRequest): Promise<HttpResponse<TBody>> {
      const response = await handler(request);
      return response as HttpResponse<TBody>;
    },

    get<TBody>(request: HttpMethodRequest): Promise<HttpResponse<TBody>> {
      return this.request<TBody>({ ...request, method: 'GET' });
    },

    post<TBody>(request: HttpMethodRequest): Promise<HttpResponse<TBody>> {
      return this.request<TBody>({ ...request, method: 'POST' });
    },

    put<TBody>(request: HttpMethodRequest): Promise<HttpResponse<TBody>> {
      return this.request<TBody>({ ...request, method: 'PUT' });
    },

    patch<TBody>(request: HttpMethodRequest): Promise<HttpResponse<TBody>> {
      return this.request<TBody>({ ...request, method: 'PATCH' });
    },

    delete(request: HttpMethodRequest): Promise<HttpResponse> {
      return this.request({ ...request, method: 'DELETE' });
    },
  };
}

function isAbortSignalAborted(signal: AbortSignalLike | undefined): boolean {
  return signal?.aborted === true;
}

function isTransportBodyInit(body: unknown): body is TransportBodyInit {
  return (
    typeof body === 'string' ||
    isUint8Array(body) ||
    isArrayBuffer(body) ||
    isFormData(body)
  );
}
