import { ContractFunctionArg, ContractSchemaFunction } from '@/types/types';

export const generateSampleValue = (
  typeSchema: ContractFunctionArg['type_schema'],
): unknown => {
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
    case 'array':
      return [];
    case 'object':
      return {};
    case 'null':
      return null;
    default:
      return null;
  }
};

export const generateSampleArgs = (func: ContractSchemaFunction): string => {
  if (!func.params?.args?.length) {
    return '{}';
  }

  const args: Record<string, unknown> = {};
  for (const arg of func.params.args) {
    args[arg.name] = generateSampleValue(arg.type_schema);
  }

  return JSON.stringify(args, null, 2);
};

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
