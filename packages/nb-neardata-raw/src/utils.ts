interface CamelCaseObject {
  [key: string]: unknown;
}

const CACHE_LIMIT = 10_000;
const cache = new Map<string, string>();

const camelCase = (str: string): string => {
  if (!str.includes('_')) return str;

  const cached = cache.get(str);

  if (cached !== undefined) return cached;

  const converted = str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

  if (cache.size < CACHE_LIMIT) cache.set(str, converted);

  return converted;
};

export const camelCaseKeys = <T>(obj: T): T => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys) as T;
  }

  const newObj: CamelCaseObject = {};

  for (const [key, value] of Object.entries(obj)) {
    newObj[camelCase(key)] = camelCaseKeys(value);
  }

  return newObj as T;
};
