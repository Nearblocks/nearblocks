export const createCache = <T>(ttl: number, max = 50) => {
  const store = new Map<string, { expires: number; value: T }>();

  return {
    get: (key: string): T | undefined => {
      const hit = store.get(key);

      if (!hit) return undefined;

      if (hit.expires < Date.now()) {
        store.delete(key);

        return undefined;
      }

      return hit.value;
    },
    set: (key: string, value: T) => {
      if (store.size >= max) {
        store.delete(store.keys().next().value as string);
      }

      store.set(key, { expires: Date.now() + ttl, value });
    },
  };
};
