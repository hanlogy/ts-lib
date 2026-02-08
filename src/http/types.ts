export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export type HttpHeaders = Readonly<Record<string, string>>;

export interface HttpClientConfiguration {
  readonly baseUrl?: string;
  readonly headers?: HttpHeaders;
  readonly middlewares?: readonly HttpMiddleware[];
  readonly transport?: HttpTransport;
  readonly timeoutMs?: number;
  // Extend/override codecs for custom content types.
  readonly codecs?: readonly BodyCodec[];
}

export interface HttpResponse<T = unknown> {
  readonly url: string;
  readonly status: number;
  readonly headers: HttpHeaders;
  readonly body: T;
}

export interface HttpRequest {
  readonly method: HttpMethod;
  readonly url: string;
  readonly headers?: HttpHeaders;
  readonly body?: unknown;
  readonly query?: HttpQuery;
  readonly abortSignal?: AbortSignalLike;
  readonly timeoutMs?: number;
}

export type HttpMethodRequest = Omit<HttpRequest, 'method'>;

export type HttpNext = (request: HttpRequest) => Promise<HttpResponse>;

export interface HttpMiddleware {
  handle(request: HttpRequest, next: HttpNext): Promise<HttpResponse>;
}

export interface HttpClient {
  request: <T>(request: HttpRequest) => Promise<HttpResponse<T>>;
  get: <T>(request: HttpMethodRequest) => Promise<HttpResponse<T>>;
  post: <T>(request: HttpMethodRequest) => Promise<HttpResponse<T>>;
  put: <T>(request: HttpMethodRequest) => Promise<HttpResponse<T>>;
  patch: <T>(request: HttpMethodRequest) => Promise<HttpResponse<T>>;
  delete: (request: HttpMethodRequest) => Promise<HttpResponse>;
}

export type HttpQuery = Readonly<Record<string, string | readonly string[]>>;

export interface HttpAbortSetup {
  readonly abortSignalForTransport?: AbortSignalLike;
  readonly didTimeout: boolean;
  cleanup: () => void;
}

export interface HttpAbortController {
  readonly signal: AbortSignalLike;
  abort: () => void;
}

export interface EncodedBody {
  body?: TransportBodyInit;
}

export interface TransportBody {
  text?: string;
  bytes?: Uint8Array;
}

export interface BodyCodec {
  supportsMediaType(mediaType: string): boolean;
  encode: (body: unknown) => EncodedBody;
  decode(body: TransportBody, mediaType: string): unknown;
}

export interface AbortSignalLike {
  readonly aborted: boolean;
  readonly addEventListener?: (type: 'abort', listener: () => void) => void;
  readonly removeEventListener?: (type: 'abort', listener: () => void) => void;
}

export type TransportRequest = Pick<
  HttpRequest,
  'method' | 'url' | 'headers' | 'abortSignal'
> & {
  readonly body?: TransportBodyInit;
};

export type TransportResponse = Omit<HttpResponse, 'body'> & {
  body: TransportBody;
};

export interface HttpTransport {
  // Allow swapping transport per environment (fetch, custom native, test mocks).
  send(request: TransportRequest): Promise<TransportResponse>;
}

/**
 * Opaque "shape" so we do not depend on DOM lib types in TypeScript.
 * Runtime checks are used (via globalThis.FormData).
 */
export interface FormDataLike {
  append: (name: string, value: unknown, fileName?: string) => void;
}
export type TransportBodyInit =
  | string
  | Uint8Array
  | ArrayBuffer
  | FormDataLike;

export interface FetchLikeRequestInit {
  method: string;
  headers?: HttpHeaders;
  body?: TransportBodyInit;
  signal?: AbortSignalLike;
}

export interface FetchLikeResponseHeaders {
  forEach: (callback: (value: string, key: string) => void) => void;
}

export interface FetchLikeResponse {
  status: number;
  url: string;
  headers: FetchLikeResponseHeaders;
  text(): Promise<string>;
  arrayBuffer?(): Promise<ArrayBuffer>;
}

export type FetchLike = (
  url: string,
  init: FetchLikeRequestInit,
) => Promise<FetchLikeResponse>;
