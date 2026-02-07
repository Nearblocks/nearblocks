'use client';

import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from 'zod-resolver-lite';

import { action } from '@/actions/contract';
import { CodeBlock } from '@/components/code-block';
import { Copy } from '@/components/copy';
import { toGas, toYocto } from '@/lib/format';
import { viewFunction } from '@/lib/rpc';
import { FormData, formSchema } from '@/lib/schema/contract';
import { useWalletStore } from '@/stores/wallet';
import { ContractAbiSchema, ContractSchemaFunction } from '@/types/types';
import { Button } from '@/ui/button';
import { Field, FieldGroup } from '@/ui/field';
import { Label } from '@/ui/label';

import { Arguments } from './arguments';
import { Info } from './info';
import { MethodSelector } from './method';
import { ExecutionMode } from './mode';
import { ChangeOptions, ViewOptions } from './options';
import { generateSampleArgs, generateSampleValueFromData } from './utils';

export type Props = {
  loading?: boolean;
  methods?: string[];
  schema?: ContractAbiSchema;
};

export const MethodsForm = ({
  loading = false,
  methods = [],
  schema,
}: Props) => {
  const { address } = useParams();
  const wallet = useWalletStore((s) => s.wallet);
  const connector = useWalletStore((s) => s.connector);
  const [result, setResult] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);
  const [isFetchingArgs, setIsFetchingArgs] = useState(false);

  const hasSchema = !!schema;

  const functions = useMemo(() => {
    return schema?.body.functions ?? [];
  }, [schema]);

  const groupedMethods = useMemo(() => {
    const viewMethods = functions
      .filter((f) => f.kind === 'view')
      .map((f) => f.name)
      .toSorted((a, b) => a.localeCompare(b));

    const callMethods = functions
      .filter((f) => f.kind === 'call')
      .map((f) => f.name)
      .toSorted((a, b) => a.localeCompare(b));

    const groups: { items: string[]; value: string }[] = [];

    if (viewMethods.length > 0) {
      groups.push({ items: viewMethods, value: 'View Methods' });
    }
    if (callMethods.length > 0) {
      groups.push({ items: callMethods, value: 'Call Methods' });
    }

    return groups;
  }, [functions]);

  const methodsMap = useMemo(() => {
    const map = new Map<string, ContractSchemaFunction>();
    for (const func of functions) {
      map.set(func.name, func);
    }
    return map;
  }, [functions]);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    trigger,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      args: '{}',
      blockId: '',
      blockRef: 'finality',
      deposit: '0',
      finality: 'final',
      gas: '30',
      method: '',
      mode: 'view',
    },
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    reValidateMode: 'onBlur',
  });

  const mode = watch('mode');
  const blockRef = watch('blockRef');
  const selectedMethod = watch('method');
  const selectedFunc = selectedMethod ? methodsMap.get(selectedMethod) : null;

  useEffect(() => {
    const subscription = watch(() => {
      setResult(null);
      setError(null);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (selectedFunc) {
      setValue('mode', selectedFunc.kind === 'view' ? 'view' : 'change');
      setValue('args', generateSampleArgs(selectedFunc));
    }
  }, [selectedFunc, setValue]);

  const handleFetchArgs = async () => {
    if (!address || !selectedMethod) return;

    setIsFetchingArgs(true);
    try {
      const response = await action(address as string, selectedMethod);
      if (response?.args) {
        const argsData = response.args as {
          args_base64?: null | string;
          args_json?: unknown;
        };

        if (argsData.args_json) {
          const sampleArgs = generateSampleValueFromData(argsData.args_json);
          setValue('args', JSON.stringify(sampleArgs, null, 2));
        } else {
          setValue('args', '{}');
        }
      }
    } catch (err) {
      console.error('Failed to fetch arguments:', err);
    } finally {
      setIsFetchingArgs(false);
    }
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    setResult(null);
    setError(null);

    if (!address) return;

    try {
      if (data.mode === 'change') {
        if (!wallet) {
          await connector?.connect();
          return;
        }
        const response = await wallet.signAndSendTransaction({
          actions: [
            {
              params: {
                args: JSON.parse(data.args || '{}'),
                deposit: toYocto(data.deposit ?? '0'),
                gas: toGas(data.gas),
                methodName: data.method,
              },
              type: 'FunctionCall',
            },
          ],
          receiverId: address as string,
        });
        setResult(JSON.stringify(response, null, 2));
      } else {
        let blockId: number | string | undefined;
        if (data.blockRef === 'blockId' && data.blockId?.trim()) {
          const trimmed = data.blockId.trim();
          const parsed = Number(trimmed);
          blockId =
            !isNaN(parsed) && Number.isInteger(parsed) ? parsed : trimmed;
        }

        const response = await viewFunction(
          address as string,
          data.method,
          JSON.parse(data.args || '{}'),
          data.blockRef === 'finality' ? data.finality : undefined,
          blockId,
        );
        setResult(JSON.stringify(response, null, 2));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
    }
  };

  return (
    <>
      <Info hasSchema={hasSchema} loading={loading} />
      <form
        className="pt-3 pb-5 md:rounded-lg md:border md:px-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FieldGroup className="w-full max-w-lg gap-5">
          <MethodSelector
            control={control}
            errors={errors}
            groupedMethods={groupedMethods}
            hasSchema={hasSchema}
            loading={loading ?? false}
            methods={methods}
            onMethodChange={(value) => {
              if (value) {
                trigger('method');
              }
            }}
          />
          <ExecutionMode control={control} hasSchema={hasSchema} />
          <Arguments
            control={control}
            errors={errors}
            hasSchema={hasSchema}
            isFetchingArgs={isFetchingArgs}
            mode={mode}
            onFetchArgs={handleFetchArgs}
            selectedMethod={selectedMethod}
          />
          {mode === 'view' && (
            <ViewOptions
              blockRef={blockRef}
              control={control}
              errors={errors}
              register={register}
            />
          )}
          {mode === 'change' && (
            <ChangeOptions errors={errors} register={register} />
          )}
          <Field orientation="horizontal">
            <Button
              className="w-full"
              disabled={isSubmitting}
              type="submit"
              variant="secondary"
            >
              {mode === 'change' ? 'Write' : 'Read'}
            </Button>
          </Field>
          {result && (
            <Field>
              <div className="flex items-center justify-between">
                <Label>Response</Label>
                <Copy size="sm" text={result} />
              </div>
              <div className="scroll-overlay max-h-116 overflow-auto">
                <CodeBlock code={result} language="json" />
              </div>
            </Field>
          )}
          {error && (
            <Field>
              <div className="flex items-center justify-between">
                <Label>Error</Label>
                <Copy size="sm" text={error} />
              </div>
              <div className="bg-red-background text-red-foreground text-body-xs scroll-overlay max-h-40 overflow-y-auto rounded-lg border p-3">
                {error}
              </div>
            </Field>
          )}
        </FieldGroup>
      </form>
    </>
  );
};
