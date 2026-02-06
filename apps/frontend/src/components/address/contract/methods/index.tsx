'use client';

import { use, useMemo } from 'react';

import { ContractSchema } from 'nb-schemas';

import { ContractAbiSchema } from '@/types/types';

import { MethodsForm } from './methods';

type Props = {
  loading?: boolean;
  methodsPromise?: Promise<ContractSchema | null>;
};

const isAbiSchema = (schema: unknown): schema is ContractAbiSchema => {
  return (
    typeof schema === 'object' &&
    schema !== null &&
    'body' in schema &&
    typeof (schema as ContractAbiSchema).body === 'object' &&
    'functions' in (schema as ContractAbiSchema).body &&
    Array.isArray((schema as ContractAbiSchema).body.functions)
  );
};

export const ContractMethods = ({ loading, methodsPromise }: Props) => {
  const data = !loading && methodsPromise ? use(methodsPromise) : null;

  const methods = useMemo(() => {
    return (data?.method_names ?? []).toSorted((a, b) => a.localeCompare(b));
  }, [data]);

  const abiSchema = data?.schema;
  const schema = isAbiSchema(abiSchema) ? abiSchema : undefined;

  return (
    <div className="px-1">
      <MethodsForm loading={loading} methods={methods} schema={schema} />
    </div>
  );
};
