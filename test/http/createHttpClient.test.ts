import { createHttpClient } from '@/http';
import {
  RequestAbortedError,
  RequestTimeoutError,
  UnsupportedContentTypeError,
} from '@/http/helpers/clientErrors';
import type {
  AbortSignalLike,
  HttpHeaders,
  HttpTransport,
  TransportRequest,
  TransportResponse,
} from '@/http/types';

class TestAbortSignal implements AbortSignalLike {
  aborted = false;

  private readonly listeners = new Set<() => void>();

  addEventListener = (_type: 'abort', listener: () => void): void => {
    this.listeners.add(listener);
  };

  removeEventListener = (_type: 'abort', listener: () => void): void => {
    this.listeners.delete(listener);
  };

  dispatchAbort(): void {
    for (const listener of [...this.listeners]) {
      listener();
    }
  }
}

class TestAbortController {
  readonly signal = new TestAbortSignal();

  abort = (): void => {
    if (this.signal.aborted) {
      return;
    }

    this.signal.aborted = true;
    this.signal.dispatchAbort();
  };
}

function createAbortableTransport(options: {
  readonly response?: TransportResponse;
  readonly onRequest?: (request: TransportRequest) => void;
}): HttpTransport {
  return {
    send: jest.fn<Promise<TransportResponse>, [TransportRequest]>(
      async (request) => {
        options.onRequest?.(request);

        if (options.response) {
          return options.response;
        }

        return new Promise<TransportResponse>((_resolve, reject) => {
          const onAbort = (): void => {
            reject(new Error('aborted'));
          };

          if (request.abortSignal?.aborted === true) {
            onAbort();
            return;
          }

          request.abortSignal?.addEventListener?.('abort', onAbort);
        });
      },
    ),
  };
}

function createJsonResponse(body: unknown): TransportResponse {
  const headers: HttpHeaders = { 'content-type': 'application/json' };

  return {
    url: 'https://example.com/response',
    status: 200,
    headers,
    body: {
      text: JSON.stringify(body),
    },
  };
}

describe('createHttpClient', () => {
  const originalAbortController = Reflect.get(globalThis, 'AbortController');

  beforeEach(() => {
    Reflect.set(globalThis, 'AbortController', TestAbortController);
  });

  afterEach(() => {
    if (originalAbortController === undefined) {
      Reflect.deleteProperty(globalThis, 'AbortController');
    } else {
      Reflect.set(globalThis, 'AbortController', originalAbortController);
    }
    jest.useRealTimers();
  });

  test('json encode + decode', async () => {
    const transportRequestList: TransportRequest[] = [];

    const transport = createAbortableTransport({
      response: createJsonResponse({ ok: true }),
      onRequest: (request) => {
        transportRequestList.push(request);
      },
    });

    const client = createHttpClient({
      baseUrl: 'https://example.com/api',
      headers: { 'X-Default': '1' },
      transport,
    });

    const response = await client.post<{ ok: boolean }>({
      url: '/v1/test',
      query: { a: '1', b: ['x', 'y'] },
      headers: { 'Content-Type': 'application/json', 'X-Req': '2' },
      body: { hello: 'world' },
    });

    expect(response.body).toEqual({ ok: true });

    expect(transportRequestList).toHaveLength(1);
    const request = transportRequestList[0];
    if (!request) {
      throw new Error('request is undefined');
    }

    expect(request.method).toBe('POST');
    expect(request.url).toBe('https://example.com/api/v1/test?a=1&b=x&b=y');
    expect(request.headers).toEqual({
      'x-default': '1',
      'content-type': 'application/json',
      'x-req': '2',
    });
    expect(request.body).toBe('{"hello":"world"}');
  });

  test('missing request content-type', async () => {
    jest.useFakeTimers();

    const transport = createAbortableTransport({
      response: createJsonResponse({ ok: true }),
    });

    const client = createHttpClient({
      transport,
      timeoutMs: 1000,
    });

    await expect(
      client.post({
        url: '/v1/test',
        body: { not: 'transport body init' },
      }),
    ).rejects.toBeInstanceOf(UnsupportedContentTypeError);

    expect(jest.getTimerCount()).toBe(0);
  });

  test('unsupported response content-type', async () => {
    const transport = createAbortableTransport({
      response: {
        url: 'https://example.com/response',
        status: 200,
        headers: { 'content-type': 'application/xml' },
        body: { text: '<ok />' },
      },
    });

    const client = createHttpClient({ transport });

    await expect(
      client.get({
        url: '/v1/test',
      }),
    ).rejects.toBeInstanceOf(UnsupportedContentTypeError);
  });

  test('abort before send', async () => {
    const transport = createAbortableTransport({
      response: createJsonResponse({ ok: true }),
    });

    const client = createHttpClient({ transport });

    const abortedSignal: AbortSignalLike = {
      aborted: true,
    };

    await expect(
      client.get({
        url: '/v1/test',
        abortSignal: abortedSignal,
      }),
    ).rejects.toBeInstanceOf(RequestAbortedError);

    expect(transport.send).not.toHaveBeenCalled();
  });

  test('abort during send', async () => {
    const upstreamController = new TestAbortController();

    const transport = createAbortableTransport({});
    const client = createHttpClient({ transport });

    const promise = client.get({
      url: '/v1/test',
      abortSignal: upstreamController.signal,
    });

    const expectation =
      expect(promise).rejects.toBeInstanceOf(RequestAbortedError);

    upstreamController.abort();

    await expectation;
  });

  test('timeout', async () => {
    jest.useFakeTimers();

    const transport = createAbortableTransport({});

    const client = createHttpClient({
      transport,
      timeoutMs: 10,
    });

    const promise = client.get({
      url: '/v1/test',
    });

    const caught = promise.catch((error: unknown) => error);

    await jest.advanceTimersByTimeAsync(10);

    const error = await caught;
    expect(error).toBeInstanceOf(RequestTimeoutError);
    expect(error).toMatchObject({ timeoutMs: 10 });
  });

  test('cleanup clears timeout after success', async () => {
    jest.useFakeTimers();

    let capturedAbortSignal: AbortSignalLike | undefined;

    const transport = createAbortableTransport({
      response: createJsonResponse({ ok: true }),
      onRequest: (request) => {
        capturedAbortSignal = request.abortSignal;
      },
    });

    const client = createHttpClient({
      transport,
      timeoutMs: 50,
    });

    await client.get({ url: '/v1/test' });

    await jest.advanceTimersByTimeAsync(50);

    expect(capturedAbortSignal?.aborted).toBe(false);
  });
});
