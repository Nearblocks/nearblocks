interface CamelCaseObject {
  [key: string]: unknown;
}

const camelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
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
