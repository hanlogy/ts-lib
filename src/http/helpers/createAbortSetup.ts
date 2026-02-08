import type {
  HttpAbortController,
  HttpAbortSetup,
  AbortSignalLike,
} from '../types';
import { TransportUnavailableError } from './clientErrors';
import { getGlobalConstructor } from '@/utils/globalThis';

function getAbortController(): HttpAbortController | undefined {
  const constructor =
    getGlobalConstructor<HttpAbortController>('AbortController');

  return constructor ? new constructor() : undefined;
}

function subscribeAbort(
  { addEventListener, removeEventListener }: AbortSignalLike,
  onAbort: () => void,
): () => void {
  if (addEventListener && removeEventListener) {
    addEventListener('abort', onAbort);

    return () => {
      removeEventListener('abort', onAbort);
    };
  }

  // No subscription API, best effort is "no-op cleanup".
  return () => undefined;
}

export function createAbortSetup({
  upstreamAbortSignal,
  timeoutMs,
}: {
  upstreamAbortSignal?: AbortSignalLike;
  timeoutMs?: number;
}): HttpAbortSetup {
  // Fast path: only upstream abort, no timeout
  if (timeoutMs === undefined) {
    return {
      abortSignalForTransport: upstreamAbortSignal,
      cleanup: () => undefined,
      didTimeout: false,
    };
  }

  // Timeout requires AbortController + timers (to actually abort the transport).
  const controller = getAbortController();
  if (!controller) {
    throw new TransportUnavailableError(
      'Timeout requires AbortController in this environment.',
    );
  }

  let didTimeout = false;

  const timeoutHandle = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  const unsubscribe =
    upstreamAbortSignal !== undefined
      ? subscribeAbort(upstreamAbortSignal, () => {
          controller.abort();
        })
      : (): undefined => undefined;

  return {
    abortSignalForTransport: controller.signal,
    cleanup: (): void => {
      clearTimeout(timeoutHandle);
      unsubscribe();
    },
    // expose didTimeout as a live value (not a snapshot)
    get didTimeout(): boolean {
      return didTimeout;
    },
  };
}
