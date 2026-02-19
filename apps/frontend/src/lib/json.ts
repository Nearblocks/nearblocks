type JsonPrimitive = boolean | null | number | string;
type JsonValue = JsonArray | JsonObject | JsonPrimitive;
interface JsonObject {
  [key: string]: JsonValue;
}
type JsonArray = JsonValue[];

interface SafeStringifyOptions {
  indentation?: number | string;
  trace?: boolean;
}

interface Serializable {
  toJSON(): unknown;
}

const hasToJSON = (value: unknown): value is Serializable => {
  return (
    value !== null &&
    value !== undefined &&
    typeof (value as Serializable).toJSON === 'function'
  );
};

const serializeValue = (
  value: unknown,
  seen: WeakMap<object, string>,
  trace: boolean,
  currentPath: string,
): JsonValue => {
  if (hasToJSON(value)) {
    value = value.toJSON();
  }

  if (typeof value === 'bigint') {
    if (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER) {
      return Number(value);
    }
    return value.toString();
  }

  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'object') {
    return value as JsonPrimitive;
  }

  const objectValue = value as Record<string, unknown>;

  if (seen.has(objectValue)) {
    if (!trace) {
      return '[Circular]';
    }

    const existingPath = seen.get(objectValue)!;
    const circularPath = existingPath === '' ? '*' : `*${existingPath}`;
    return `[Circular ${circularPath}]`;
  }

  seen.set(objectValue, currentPath);

  let newValue: JsonArray | JsonObject;

  if (Array.isArray(objectValue)) {
    newValue = objectValue.map((item: unknown, index: number) => {
      const nextPath =
        currentPath === '' ? `${index}` : `${currentPath}.${index}`;
      return serializeValue(item, seen, trace, nextPath);
    });
  } else {
    newValue = {} as JsonObject;
    for (const [propertyKey, propertyValue] of Object.entries(objectValue)) {
      const nextPath =
        currentPath === '' ? propertyKey : `${currentPath}.${propertyKey}`;
      (newValue as JsonObject)[propertyKey] = serializeValue(
        propertyValue,
        seen,
        trace,
        nextPath,
      );
    }
  }

  seen.delete(objectValue);

  return newValue;
};

export const safeStringify = (
  value: unknown,
  { indentation, trace = false }: SafeStringifyOptions = {},
): string => {
  const seen = new WeakMap<object, string>();
  const serializedValue = serializeValue(value, seen, trace, '');
  return JSON.stringify(serializedValue, undefined, indentation);
};
