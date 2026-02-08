// Compose middlewares into one handler.
import type {
  HttpMiddleware,
  HttpNext,
  HttpRequest,
  HttpResponse,
} from '../types';

/**
 * Compose a list of middlewares into a single `HttpNext` function.
 *
 * Order guarantee:
 * - The first middleware in the array runs first on the request path.
 * - The last middleware in the array runs closest to the terminal handler
 *   (transport).
 *
 * Example with [m1, m2, m3]:
 * - Request path:  m1 -> m2 -> m3 -> terminal
 * - Response path: terminal -> m3 -> m2 -> m1
 *
 * Why the loop runs backwards:
 * - We build the chain from the inside out.
 * - Start with `next = terminal`
 * - Wrap it with the last middleware first, then keep wrapping until the first
 *   middleware becomes the outermost wrapper.
 *
 * Equivalent expansion:
 * next = (request) => m1.handle(request, (request1) =>
 *   m2.handle(request1, (request2) =>
 *     m3.handle(request2, (request3) =>
 *       terminal(request3)
 *     )
 *   )
 * )
 */
export function composeMiddlewares(
  middlewares: readonly HttpMiddleware[],
  terminal: (request: HttpRequest) => Promise<HttpResponse>,
): HttpNext {
  // Start from the terminal handler (usually "encode -> transport -> decode").
  let next: HttpNext = (request) => terminal(request);

  // Wrap "next" from the end towards the start, so middlewares[0] becomes the
  // outermost wrapper.
  for (let index = middlewares.length - 1; index >= 0; index -= 1) {
    const current = middlewares[index];
    if (!current) {
      continue;
    }

    // Keep a stable reference to the previously built chain.
    const previousNext = next;

    // Create a new "next" that runs `current`, and delegates to the chain built
    // so far.
    next = (request): Promise<HttpResponse> =>
      current.handle(request, previousNext);
  }

  return next;
}
