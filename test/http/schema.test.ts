import { createHttpClient } from '@/http';
import type {
  HttpHeaders,
  HttpTransport,
  SchemaValidator,
  TransportResponse,
} from '@/http/types';

function makeTransport(body: unknown): HttpTransport {
  const headers: HttpHeaders = { 'content-type': 'application/json' };
  const response: TransportResponse = {
    url: 'https://example.com',
    status: 200,
    headers,
    body: { text: JSON.stringify(body) },
  };
  return { send: jest.fn().mockResolvedValue(response) };
}

function makeSchema<T>(transform?: (data: unknown) => T): jest.Mocked<SchemaValidator<T>> {
  return { parse: jest.fn(transform ?? ((data): T => data as T)) };
}

describe('schema validation', () => {
  test('parse() receives decoded response body', async () => {
    const schema = makeSchema<{ id: number }>();
    const client = createHttpClient({ transport: makeTransport({ id: 1 }) });

    await client.get({ url: '/test', schema });

    expect(schema.parse).toHaveBeenCalledTimes(1);
    expect(schema.parse).toHaveBeenCalledWith({ id: 1 });
  });

  test('response body is the return value of parse()', async () => {
    const transformed = { id: 99, extra: 'injected' };
    const schema = makeSchema(() => transformed);
    const client = createHttpClient({ transport: makeTransport({ id: 1 }) });

    const response = await client.get({ url: '/test', schema });

    expect(response.body).toBe(transformed);
  });

  test('parse() error propagates as-is', async () => {
    const parseError = new Error('validation failed');
    const schema: SchemaValidator<never> = {
      parse: () => { throw parseError; },
    };
    const client = createHttpClient({ transport: makeTransport({ bad: 'data' }) });

    await expect(client.get({ url: '/test', schema })).rejects.toBe(parseError);
  });

  test('without schema, body passes through unparsed', async () => {
    const serverPayload = { id: 1, name: 'alice' };
    const client = createHttpClient({ transport: makeTransport(serverPayload) });

    const response = await client.get({ url: '/test' });

    expect(response.body).toEqual(serverPayload);
  });

  test('parse() is called for post, put, patch', async () => {
    for (const method of ['post', 'put', 'patch'] as const) {
      const schema = makeSchema<{ ok: boolean }>();
      const client = createHttpClient({ transport: makeTransport({ ok: true }) });

      await client[method]({ url: '/test', schema });

      expect(schema.parse).toHaveBeenCalledWith({ ok: true });
    }
  });

  test('schema is not called without one (no accidental invocation)', async () => {
    const schema = makeSchema();
    const client = createHttpClient({ transport: makeTransport({ id: 1 }) });

    // call without schema — the mock should never be invoked
    await client.get({ url: '/test' });

    expect(schema.parse).not.toHaveBeenCalled();
  });

  describe('type-level enforcement', () => {
    test('explicit type param without schema is a compile-time error', () => {
      const client = createHttpClient({ transport: makeTransport({}) });

      // @ts-expect-error — explicit <T> without schema must be rejected
      void client.get<{ id: number }>({ url: '/test' });

      // @ts-expect-error — same for post
      void client.post<{ id: number }>({ url: '/test' });
    });

    test('body type is unknown without a schema', async () => {
      const client = createHttpClient({ transport: makeTransport({ id: 1 }) });
      const response = await client.get({ url: '/test' });

      // Asserting unknown: assigning to a specific type without narrowing should error
      // @ts-expect-error — body is unknown, not assignable to { id: number } directly
      const _typed: { id: number } = response.body;
      void _typed;
    });

    test('body type is inferred from schema', async () => {
      const schema: SchemaValidator<{ id: number }> = { parse: (d) => d as { id: number } };
      const client = createHttpClient({ transport: makeTransport({ id: 1 }) });
      const response = await client.get({ url: '/test', schema });

      // This must compile: body is { id: number }
      const id: number = response.body.id;
      expect(id).toBe(1);
    });
  });
});
