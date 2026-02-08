/**
 * Resolve local filesystem-like paths,
 */
export function resolveWithBasePath({
  base,
  ref,
}: {
  base: string;
  ref: string;
}): string {
  if (
    ref.startsWith('/') ||
    ref.startsWith('//') ||
    /^https?:\/\//i.test(ref)
  ) {
    return ref;
  }

  const resolved = resolveRelativePath({ base, ref });
  if (!resolved || resolved.startsWith('/')) {
    return resolved;
  }

  const baseHasLeadingSlashMatch = base.match(/^(\/*)/);
  if (!baseHasLeadingSlashMatch || baseHasLeadingSlashMatch.length < 2) {
    return resolved;
  }
  return `${baseHasLeadingSlashMatch[1]}${resolved}`;
}

/**
 * Resolve ref against an absolute https? `base`
 */
export function resolveWithBaseUrl({
  base: baseUrl,
  ref,
}: {
  base: string;
  ref: string;
}): string {
  if (ref.startsWith('//') || /^https?:\/\//i.test(ref)) {
    return ref;
  }

  const baseUrlMatched = /^((?:https?:)?\/\/[^/?#]+|[^/?#]+)(\/[^?#]*)?/i.exec(
    baseUrl,
  );

  if (!baseUrlMatched) {
    return ref;
  }

  // "https://abc.com" or "//abc.com"
  const origin = baseUrlMatched[1];
  const basePath = baseUrlMatched[2] ?? '/';

  if (ref.startsWith('/')) {
    return `${origin}${ref}`;
  }

  const resolvedPath = resolveRelativePath({ base: basePath, ref: ref });

  if (resolvedPath.startsWith('/')) {
    return `${origin}${resolvedPath}`;
  }

  return `${origin}/${resolvedPath}`;
}

function resolveRelativePath({
  base,
  ref,
}: {
  base: string;
  ref: string;
}): string {
  const baseHasTrailingSlash = base.endsWith('/');

  const baseParts = base
    .replace(/^\/*|\/*$/g, '')
    .replace(/\/+/g, '/')
    .split('/');

  const pathParts = ref.replace(/\/+/g, '/').replace(/^\.\//, '').split('/');

  let depth = 0;

  for (const part of pathParts) {
    if (part === '..') {
      depth++;
      continue;
    }
    break;
  }

  const resolvedBaseLength = Math.max(0, baseParts.length - depth);
  const resolvedBaseParts = baseParts.slice(0, resolvedBaseLength).join('/');
  const resolvedPathParts = pathParts.slice(depth).join('/');

  const finalParts: string[] = [];
  if (resolvedBaseParts) {
    finalParts.push(resolvedBaseParts);
  }

  if (resolvedPathParts.length && resolvedPathParts !== '/') {
    finalParts.push(resolvedPathParts);
  } else if (baseHasTrailingSlash) {
    finalParts.push('');
  }

  return finalParts.join('/');
}
