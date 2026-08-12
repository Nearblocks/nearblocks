'use client';

import { useParams } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';

import { action } from '@/actions/contract';
import { CodeBlock } from '@/components/code-block';
import { Copy } from '@/components/copy';
import { useLocale } from '@/hooks/use-locale';
import { useViewMutation } from '@/hooks/use-rpc';
import { useWallet } from '@/hooks/use-wallet';
import {
  generateSampleArgs,
  generateSampleValueFromData,
} from '@/lib/contract';
import { toGas, toYocto } from '@/lib/format';
import { FormData, formSchema } from '@/lib/schema/contract';
import { zodResolver } from '@/lib/zod';
import { ContractSchemaFunction } from '@/types/types';
import { Button } from '@/ui/button';
import { Field, FieldGroup } from '@/ui/field';
import { Label } from '@/ui/label';

import { Arguments } from './arguments';
import { ExecutionMode } from './mode';
import { ChangeOptions, ViewOptions } from './options';

export type Props = {
  func?: ContractSchemaFunction;
  hasSchema: boolean;
  kind: 'call' | 'unknown' | 'view';
  name: string;
};

export const MethodPanel = ({ func, hasSchema, kind, name }: Props) => {
  const { t } = useLocale('address');
  const { address } = useParams();
  const uid = useId();
  const wallet = useWallet((s) => s.wallet);
  const connector = useWallet((s) => s.connector);
  const [result, setResult] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);
  const [isFetchingArgs, setIsFetchingArgs] = useState(false);
  const { trigger: triggerViewFunction } = useViewMutation();

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      args: func ? generateSampleArgs(func) : '{}',
      blockId: '',
      blockRef: 'finality',
      deposit: '0',
      finality: 'final',
      gas: '30',
      method: name,
      mode: kind === 'call' ? 'change' : 'view',
    },
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
    reValidateMode: 'onBlur',
  });

  const mode = watch('mode');
  const blockRef = watch('blockRef');

  useEffect(() => {
    const subscription = watch(() => {
      setResult(null);
      setError(null);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleFetchArgs = async () => {
    if (!address) return;

    setIsFetchingArgs(true);
    try {
      const response = await action(address as string, name);
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

        const response = await triggerViewFunction({
          args: JSON.parse(data.args || '{}'),
          blockId,
          contract: address as string,
          finality: data.blockRef === 'finality' ? data.finality : undefined,
          method: data.method,
        });
        setResult(JSON.stringify(response, null, 2));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="w-full max-w-lg gap-4">
        {!hasSchema && <ExecutionMode control={control} uid={uid} />}
        <Arguments
          control={control}
          errors={errors}
          hasSchema={hasSchema}
          isFetchingArgs={isFetchingArgs}
          mode={mode}
          onFetchArgs={handleFetchArgs}
          selectedMethod={name}
          uid={uid}
        />
        {mode === 'view' && (
          <ViewOptions
            blockRef={blockRef}
            control={control}
            errors={errors}
            register={register}
            uid={uid}
          />
        )}
        {mode === 'change' && (
          <ChangeOptions errors={errors} register={register} uid={uid} />
        )}
        <Field orientation="horizontal">
          <Button
            className="w-full"
            disabled={isSubmitting}
            type="submit"
            variant="secondary"
          >
            {mode === 'change'
              ? t('contract.methods.write')
              : t('contract.methods.read')}
          </Button>
        </Field>
        {result && (
          <Field>
            <div className="flex items-center justify-between">
              <Label>{t('contract.methods.response')}</Label>
              <Copy size="sm" text={result} />
            </div>
            <div className="scroll-overlay max-h-116 overflow-auto">
              <CodeBlock code={result} language="json" lineNumbers />
            </div>
          </Field>
        )}
        {error && (
          <Field>
            <div className="flex items-center justify-between">
              <Label>{t('contract.methods.error')}</Label>
              <Copy size="sm" text={error} />
            </div>
            <div className="bg-red-background text-red-foreground text-body-xs scroll-overlay max-h-40 overflow-y-auto rounded-lg border p-3">
              {error}
            </div>
          </Field>
        )}
      </FieldGroup>
    </form>
  );
};
