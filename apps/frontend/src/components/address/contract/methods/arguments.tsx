'use client';

import { RiQuestionLine } from '@remixicon/react';
import { Control, Controller, FieldErrors } from 'react-hook-form';

import { JsonEditor } from '@/components/json-editor';
import { useLocale } from '@/hooks/use-locale';
import { FormData } from '@/lib/schema/contract';
import { Button } from '@/ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/ui/field';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  hasSchema: boolean;
  isFetchingArgs: boolean;
  mode: 'change' | 'view';
  onFetchArgs: () => void;
  selectedMethod: string;
};

export const Arguments = ({
  control,
  errors,
  hasSchema,
  isFetchingArgs,
  mode,
  onFetchArgs,
  selectedMethod,
}: Props) => {
  const { t } = useLocale('address');

  return (
    <Field data-invalid={!!errors.args}>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor="args">{t('contract.methods.args')}</FieldLabel>
        {mode === 'change' && !hasSchema && selectedMethod && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                disabled={isFetchingArgs}
                onClick={onFetchArgs}
                size="xs"
                type="button"
                variant="outline"
              >
                {t('contract.methods.autoDetect')}{' '}
                <RiQuestionLine className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t('contract.methods.autoDetectTip')}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <FieldDescription>
        {hasSchema
          ? t('contract.methods.hasSchemaArgs')
          : t('contract.methods.noSchemaArgs')}
      </FieldDescription>
      <Controller
        control={control}
        name="args"
        render={({ field }) => (
          <JsonEditor
            aria-invalid={!!errors.args}
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
            ref={field.ref}
            value={field.value}
          />
        )}
      />
      <FieldError errors={[errors.args]} />
    </Field>
  );
};
