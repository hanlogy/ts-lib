import { createHttpClient } from '@/http';
import {
  RequestAbortedError,
  RequestTimeoutError,
  TransportUnavailableError,
} from '@/http/helpers/clientErrors';
import type {
  HttpTransport,
  TransportRequest,
  TransportResponse,
} from '@/http/types';

class TestAbortSignal {
  aborted = false;
  private readonly listeners = new Set<() => void>();

  addEventListener = (_type: 'abort', listener: () => void): void => {
    this.listeners.add(listener);
  };

  removeEventListener = (_type: 'abort', listener: () => void): void => {
    this.listeners.delete(listener);
  };

  dispatchAbort(): void {
    for (const listener of [...this.listeners]) listener();
  }
}

class TestAbortController {
  readonly signal = new TestAbortSignal();

  abort = (): void => {
    if (this.signal.aborted) return;
    this.signal.aborted = true;
    this.signal.dispatchAbort();
  };
}

function hangingTransport(
  onRequest?: (req: TransportRequest) => void,
): HttpTransport {
  return {
    send: jest.fn(async (req: TransportRequest) => {
      onRequest?.(req);
      return new Promise<TransportResponse>((_resolve, reject) => {
        const onAbort = (): void => {
          reject(new Error('aborted'));
        };
        if (req.abortSignal?.aborted === true) {
          onAbort();
          return;
        }
        req.abortSignal?.addEventListener?.('abort', onAbort);
      });
    }),
  };
}

describe('abort and timeout', () => {
  const originalAbortController: unknown = Reflect.get(
    globalThis,
    'AbortController',
  );

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

  describe('per-request timeoutMs overrides client default', () => {
    test('per-request timeout is used instead of client default', async () => {
      jest.useFakeTimers();
      const client = createHttpClient({
        transport: hangingTransport(),
        timeoutMs: 5000,
      });

      const promise = client.get({ url: '/test', timeoutMs: 100 });
      const caught = promise.catch((e: unknown) => e);

      await jest.advanceTimersByTimeAsync(100);

      const error = await caught;
      expect(error).toBeInstanceOf(RequestTimeoutError);
      expect(error).toMatchObject({ timeoutMs: 100 });
    });

    test('null disables the client default timeout', async () => {
      jest.useFakeTimers();

      const controller = new TestAbortController();
      const client = createHttpClient({
        transport: hangingTransport(),
        timeoutMs: 50,
      });

      const caught = client
        .get({ url: '/test', timeoutMs: null, abortSignal: controller.signal })
        .catch((e: unknown) => e);

      // Advance past the client default — should NOT fire
      await jest.advanceTimersByTimeAsync(50);
      expect(jest.getTimerCount()).toBe(0);

      // Request still pending; clean up manually
      controller.abort();
      expect(await caught).toBeInstanceOf(RequestAbortedError);
    });

    test('client default is used when request does not specify timeout', async () => {
      jest.useFakeTimers();
      const client = createHttpClient({
        transport: hangingTransport(),
        timeoutMs: 200,
      });

      const promise = client.get({ url: '/test' });
      const caught = promise.catch((e: unknown) => e);

      await jest.advanceTimersByTimeAsync(200);

      const error = await caught;
      expect(error).toBeInstanceOf(RequestTimeoutError);
      expect(error).toMatchObject({ timeoutMs: 200 });
    });
  });

  describe('upstream abort with timeout set', () => {
    test('upstream abort throws RequestAbortedError, not RequestTimeoutError', async () => {
      jest.useFakeTimers();

      const controller = new TestAbortController();
      const client = createHttpClient({
        transport: hangingTransport(),
        timeoutMs: 5000,
      });

      const promise = client.get({
        url: '/test',
        abortSignal: controller.signal,
      });
      const caught = promise.catch((e: unknown) => e);

      controller.abort();

      const error = await caught;
      expect(error).toBeInstanceOf(RequestAbortedError);
      expect(error).not.toBeInstanceOf(RequestTimeoutError);
    });

    test('timer is cleared after upstream abort', async () => {
      jest.useFakeTimers();

      const controller = new TestAbortController();
      const client = createHttpClient({
        transport: hangingTransport(),
        timeoutMs: 1000,
      });

      const caught = client
        .get({ url: '/test', abortSignal: controller.signal })
        .catch((e: unknown) => e);

      controller.abort();
      await caught;

      // No pending timers after abort cleanup
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('no AbortController in environment', () => {
    test('throws TransportUnavailableError when timeout is requested', async () => {
      Reflect.deleteProperty(globalThis, 'AbortController');

      const client = createHttpClient({ transport: hangingTransport() });

      await expect(
        client.get({ url: '/test', timeoutMs: 100 }),
      ).rejects.toBeInstanceOf(TransportUnavailableError);
    });

    test('abort-signal-only requests still work without AbortController', async () => {
      Reflect.deleteProperty(globalThis, 'AbortController');

      const controller = new TestAbortController();
      const client = createHttpClient({ transport: hangingTransport() });

      const caught = client
        .get({ url: '/test', abortSignal: controller.signal })
        .catch((e: unknown) => e);

      controller.abort();

      expect(await caught).toBeInstanceOf(RequestAbortedError);
    });
  });
});
