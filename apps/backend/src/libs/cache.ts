type CacheEntry<T> = { data: T; expiresAt: number };

export const createCache = <T>(ttlMs: number) => {
  let entry: CacheEntry<T> | null = null;

  const get = (): null | T => {
    if (entry && Date.now() < entry.expiresAt) return entry.data;
    return null;
  };

  const set = (data: T): void => {
    entry = { data, expiresAt: Date.now() + ttlMs };
  };

  const clear = (): void => {
    entry = null;
  };

  return { clear, get, set };
};
