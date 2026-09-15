import { ContractSchemaFunction, JsonSchemaNode } from '@/types/types';

const MAX_DEPTH = 12;

const resolveRef = (
  ref: string,
  definitions: Record<string, JsonSchemaNode> | undefined,
): JsonSchemaNode | undefined => {
  const name = ref.split('/').pop();
  return name ? definitions?.[name] : undefined;
};

export const generateSampleValue = (
  typeSchema: JsonSchemaNode | undefined,
  definitions?: Record<string, JsonSchemaNode>,
  seen: Set<string> = new Set(),
  depth = 0,
): unknown => {
  if (!typeSchema || depth > MAX_DEPTH) {
    return null;
  }

  if (typeSchema.$ref) {
    const name = typeSchema.$ref.split('/').pop();
    if (!name || seen.has(name)) {
      return null;
    }
    const resolved = resolveRef(typeSchema.$ref, definitions);
    if (!resolved) {
      return null;
    }
    return generateSampleValue(
      resolved,
      definitions,
      new Set(seen).add(name),
      depth + 1,
    );
  }

  if (typeSchema.allOf?.length) {
    return generateSampleValue(typeSchema.allOf[0], definitions, seen, depth);
  }

  if (typeSchema.anyOf?.length || typeSchema.oneOf?.length) {
    const branches = typeSchema.anyOf ?? typeSchema.oneOf ?? [];
    const branch = branches.find((b) => b.type !== 'null') ?? branches[0];
    return generateSampleValue(branch, definitions, seen, depth);
  }

  if (typeSchema.const !== undefined) {
    return typeSchema.const;
  }

  if (typeSchema.enum?.length) {
    return typeSchema.enum[0];
  }

  const type = Array.isArray(typeSchema.type)
    ? typeSchema.type.find((t) => t !== 'null') ?? typeSchema.type[0]
    : typeSchema.type;

  switch (type) {
    case 'string':
      return '';
    case 'integer':
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'array': {
      const items = Array.isArray(typeSchema.items)
        ? typeSchema.items[0]
        : typeSchema.items;
      if (!items) {
        return [];
      }
      return [generateSampleValue(items, definitions, seen, depth + 1)];
    }
    case 'object': {
      if (typeSchema.properties) {
        const obj: Record<string, unknown> = {};
        for (const [key, propSchema] of Object.entries(typeSchema.properties)) {
          obj[key] = generateSampleValue(
            propSchema,
            definitions,
            seen,
            depth + 1,
          );
        }
        return obj;
      }
      return {};
    }
    case 'null':
      return null;
    default:
      return null;
  }
};

export const generateSampleArgs = (
  func: ContractSchemaFunction,
  definitions?: Record<string, JsonSchemaNode>,
): string => {
  if (!func.params?.args?.length) {
    return '{}';
  }

  const args: Record<string, unknown> = {};
  for (const arg of func.params.args) {
    args[arg.name] = generateSampleValue(arg.type_schema, definitions);
  }

  return JSON.stringify(args, null, 2);
};

const MAX_TYPE_DEPTH = 6;

export const formatTypeSchema = (
  node: JsonSchemaNode | undefined,
  depth = 0,
): string => {
  if (!node || depth > MAX_TYPE_DEPTH) {
    return 'unknown';
  }

  if (node.$ref) {
    return node.$ref.split('/').pop() ?? 'unknown';
  }

  if (node.allOf?.length === 1) {
    return formatTypeSchema(node.allOf[0], depth + 1);
  }

  if (node.anyOf?.length || node.oneOf?.length) {
    const branches = node.anyOf ?? node.oneOf ?? [];
    return branches
      .map((branch) => formatTypeSchema(branch, depth + 1))
      .join(' | ');
  }

  if (node.enum?.length) {
    return node.enum.map((value) => JSON.stringify(value)).join(' | ');
  }

  const type = Array.isArray(node.type) ? node.type.join(' | ') : node.type;

  if (type === 'array') {
    const items = Array.isArray(node.items) ? node.items[0] : node.items;
    return items ? `${formatTypeSchema(items, depth + 1)}[]` : 'array';
  }

  if (type === 'integer' || type === 'number') {
    return node.format ?? type;
  }

  if (type === 'object') {
    const keys = node.properties ? Object.keys(node.properties) : [];
    if (
      node.required?.length === 1 &&
      keys.length === 1 &&
      keys[0] === node.required[0]
    ) {
      return keys[0];
    }
    if (
      node.additionalProperties &&
      typeof node.additionalProperties === 'object'
    ) {
      return `map<string, ${formatTypeSchema(
        node.additionalProperties,
        depth + 1,
      )}>`;
    }
    return 'object';
  }

  return type ?? 'unknown';
};

export type MethodDocParam = {
  name: string;
  type: string;
};

export type MethodDoc = {
  doc?: string;
  params: MethodDocParam[];
  returns?: string;
};

export const buildMethodDoc = (func: ContractSchemaFunction): MethodDoc => ({
  doc: func.doc?.trim() || undefined,
  params: (func.params?.args ?? []).map((arg) => ({
    name: arg.name,
    type: formatTypeSchema(arg.type_schema),
  })),
  returns: func.result ? formatTypeSchema(func.result.type_schema) : undefined,
});

export const generateSampleValueFromData = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    return [generateSampleValueFromData(value[0])];
  }

  if (typeof value === 'object') {
    const obj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      obj[key] = generateSampleValueFromData(val);
    }
    return obj;
  }

  const type = typeof value;
  switch (type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    default:
      return null;
  }
};
