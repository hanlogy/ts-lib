import { buildUrl } from '@/http/helpers/buildUrl';

describe('buildUrl', () => {
  test('only a base url', () => {
    expect(buildUrl({ baseUrl: 'http://example.com' })).toBe(
      'http://example.com',
    );
  });

  test('base url and url', () => {
    expect(buildUrl({ baseUrl: 'http://example.com', url: 'foo' })).toBe(
      'http://example.com/foo',
    );
  });

  test('url has leading slash', () => {
    expect(buildUrl({ baseUrl: 'http://example.com//', url: '/foo' })).toBe(
      'http://example.com/foo',
    );
  });

  test('baseUrl has ending slash, no url', () => {
    expect(buildUrl({ baseUrl: 'http://example.com//' })).toBe(
      'http://example.com/',
    );
  });

  test('empty', () => {
    expect(buildUrl()).toBe('');
  });

  test('baseUrl contains query, with query input', () => {
    const result = buildUrl({
      baseUrl: 'https://example.com/bar?key=foo',
      query: { limit: '10' },
    });
    expect(result).toBe('https://example.com/bar?key=foo&limit=10');
  });

  test('url contains query, with query input', () => {
    const result = buildUrl({
      baseUrl: 'https://example.com/',
      url: 'bar?key=foo',
      query: { limit: '10' },
    });
    expect(result).toBe('https://example.com/bar?key=foo&limit=10');
  });

  describe('url is a absolute url', () => {
    test('with scheme', () => {
      expect(
        buildUrl({
          baseUrl: 'http://example.com',
          url: 'https://readonly.page',
        }),
      ).toBe('https://readonly.page');
    });

    test('no scheme', () => {
      expect(
        buildUrl({
          baseUrl: 'http://example.com',
          url: '//readonly.page',
        }),
      ).toBe('//readonly.page');
    });
  });
});
