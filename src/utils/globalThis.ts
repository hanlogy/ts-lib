import type { Newable } from '@/helpers/types';

export function getGlobalValue(name: string): unknown {
  // use a string-indexed record because `globalThis[name]` can fail to compile
  // in TS configs that do not include the DOM lib (for example Node.js or
  // React Native). Without this, TypeScript may report that `globalThis` has no
  // matching index signature / the property does not exist for the given name.
  const record = globalThis as Record<string, unknown>;
  return record[name];
}

export function getGlobalConstructor<TInstance>(
  name: 'AbortController' | 'FormData' | 'TextDecoder',
): Newable<TInstance> | undefined {
  const value = getGlobalValue(name);

  if (typeof value !== 'function') {
    return undefined;
  }

  return value as Newable<TInstance>;
}

export function getGlobalFunction<
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  TFunction extends (...arguments_: never[]) => unknown,
>(name: 'fetch'): TFunction | undefined {
  const value = getGlobalValue(name);

  if (typeof value !== 'function') {
    return undefined;
  }

  return value as TFunction;
}
