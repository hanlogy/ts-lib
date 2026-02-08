// Explicit error types for unsupported content types, transport availability,
// decoding, abort, timeout.
export class HttpClientError extends Error {
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'HttpClientError';
  }

  readonly code: string;
}

export class UnsupportedContentTypeError extends HttpClientError {
  constructor(direction: 'request' | 'response', contentType: string) {
    super(
      'unsupportedContentType',
      `Unsupported ${direction} content type: ${contentType}`
    );
    this.name = 'UnsupportedContentTypeError';
  }
}

export class TransportUnavailableError extends HttpClientError {
  constructor(message: string) {
    super('transportUnavailable', message);
    this.name = 'TransportUnavailableError';
  }
}

export class BodyEncodingError extends HttpClientError {
  constructor(message: string) {
    super('bodyEncodingError', message);
    this.name = 'BodyEncodingError';
  }
}

export class ResponseDecodingError extends HttpClientError {
  constructor(message: string) {
    super('responseDecodingError', message);
    this.name = 'ResponseDecodingError';
  }
}

export class HttpStatusError extends HttpClientError {
  constructor(status: number, message: string) {
    super('httpStatusError', message);
    this.status = status;
    this.name = 'HttpStatusError';
  }

  readonly status: number;
}

export class RequestAbortedError extends HttpClientError {
  constructor(message: string) {
    super('requestAborted', message);
    this.name = 'RequestAbortedError';
  }
}

export class RequestTimeoutError extends HttpClientError {
  constructor(timeoutMs: number, message: string) {
    super('requestTimeout', message);
    this.timeoutMs = timeoutMs;
    this.name = 'RequestTimeoutError';
  }

  readonly timeoutMs: number;
}
