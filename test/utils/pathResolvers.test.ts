import { resolveWithBasePath, resolveWithBaseUrl } from '@/utils/pathResolvers';

describe('resolveWithBasePath', () => {
  test('ref specific', () => {
    expect(
      resolveWithBasePath({
        base: '/p/a/t/h',
        ref: '//abc',
      }),
    ).toBe('//abc');

    expect(
      resolveWithBasePath({
        base: '/p/a/t/h',
        ref: 'https://abc',
      }),
    ).toBe('https://abc');
  });

  test('simple ref', () => {
    expect(
      resolveWithBasePath({
        base: '/var/log',
        ref: 'app.log',
      }),
    ).toBe('/var/log/app.log');
  });

  test('current directory "."', () => {
    expect(
      resolveWithBasePath({
        base: '/var/log',
        ref: './app.log',
      }),
    ).toBe('/var/log/app.log');
  });

  test('single ".."', () => {
    expect(
      resolveWithBasePath({
        base: '/var/log/users',
        ref: '../website.txt',
      }),
    ).toBe('/var/log/website.txt');
  });

  test('multiple ".."', () => {
    expect(
      resolveWithBasePath({
        base: '/var/log/users',
        ref: '../../website.txt',
      }),
    ).toBe('/var/website.txt');
  });

  test('go beyond root, base is root', () => {
    expect(
      resolveWithBasePath({
        base: '/',
        ref: '../website.txt',
      }),
    ).toBe('/website.txt');
  });

  test('go beyond root, base is not root', () => {
    expect(
      resolveWithBasePath({
        base: '/1/2/3',
        ref: '../../../../a/b/c',
      }),
    ).toBe('/a/b/c');
  });

  test('normalizes extra slashes', () => {
    expect(
      resolveWithBasePath({
        base: '/var//log///',
        ref: 'app.log',
      }),
    ).toBe('/var/log/app.log');
  });

  describe('empty ref', () => {
    test('base has leading /, no trailing', () => {
      expect(
        resolveWithBasePath({
          base: '/var/log',
          ref: '',
        }),
      ).toBe('/var/log');
    });

    test('base has no leading, has trailing', () => {
      expect(
        resolveWithBasePath({
          base: 'var/log/',
          ref: '',
        }),
      ).toBe('var/log/');
    });

    test('base has no leading, no trailing', () => {
      expect(
        resolveWithBasePath({
          base: 'var/log',
          ref: '',
        }),
      ).toBe('var/log');
    });
  });

  describe('do not care', () => {
    test('strange base ref', () => {
      expect(
        resolveWithBasePath({
          base: '///var/log/',
          ref: './users/app.log',
        }),
      ).toBe('///var/log/users/app.log');
    });

    test('strange absolute ref', () => {
      expect(
        resolveWithBasePath({
          base: '/var/log/',
          ref: '///users/app.log',
        }),
      ).toBe('///users/app.log');
    });

    test('invalid relative ref', () => {
      expect(
        resolveWithBasePath({
          base: '/var/log/',
          ref: '.../.../users/app.log',
        }),
      ).toBe('/var/log/.../.../users/app.log');
    });
  });
});

describe('resolveWithBaseUrl', () => {
  test('relative ref', () => {
    expect(
      resolveWithBaseUrl({
        base: 'https://abc.com/a/b/c',
        ref: 'd',
      }),
    ).toBe('https://abc.com/a/b/c/d');
  });

  test('relative ref, base has ending slash', () => {
    expect(
      resolveWithBaseUrl({
        base: 'https://abc.com/a/b/c/',
        ref: 'd',
      }),
    ).toBe('https://abc.com/a/b/c/d');
  });

  test('one dot', () => {
    expect(
      resolveWithBaseUrl({
        base: 'https://abc.com/a/b/c/',
        ref: './d',
      }),
    ).toBe('https://abc.com/a/b/c/d');
  });

  test('one up', () => {
    expect(
      resolveWithBaseUrl({
        base: 'https://abc.com/a/b/c/',
        ref: '../d',
      }),
    ).toBe('https://abc.com/a/b/d');
  });

  test('double up', () => {
    expect(
      resolveWithBaseUrl({
        base: 'https://abc.com/a/b/c/',
        ref: '../../d',
      }),
    ).toBe('https://abc.com/a/d');
  });

  test('base from root', () => {
    expect(
      resolveWithBaseUrl({
        base: 'https://abc.com',
        ref: 'd',
      }),
    ).toBe('https://abc.com/d');
  });

  test('ref is a url', () => {
    expect(
      resolveWithBaseUrl({
        base: 'https://abc.com/a/b/',
        ref: 'https://x.com/y',
      }),
    ).toBe('https://x.com/y');
  });

  test('ref is an absolute path', () => {
    expect(
      resolveWithBaseUrl({
        base: 'https://abc.com/a/b/',
        ref: '/x',
      }),
    ).toBe('https://abc.com/x');
  });

  test('up beyond root', () => {
    expect(
      resolveWithBaseUrl({
        base: 'https://abc.com/a/b/',
        ref: '../../../../1/2/3.log',
      }),
    ).toBe('https://abc.com/1/2/3.log');
  });

  test('ref is scheme relative', () => {
    expect(
      resolveWithBaseUrl({
        base: 'https://abc.com/a/b/',
        ref: '//x.com/y',
      }),
    ).toBe('//x.com/y');
  });

  test('base is scheme relative', () => {
    expect(
      resolveWithBaseUrl({
        base: '//abc.com/a/b/',
        ref: '../y',
      }),
    ).toBe('//abc.com/a/y');
  });

  test('base has no scheme', () => {
    expect(
      resolveWithBaseUrl({
        base: 'localhost/a/b/',
        ref: '../y',
      }),
    ).toBe('localhost/a/y');
  });
});
