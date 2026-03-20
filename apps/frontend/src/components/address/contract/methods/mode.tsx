'use client';

import { Control, Controller } from 'react-hook-form';

import { useLocale } from '@/hooks/use-locale';
import { FormData } from '@/lib/schema/contract';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/ui/field';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';

type Props = {
  control: Control<FormData>;
  hasSchema: boolean;
};

export const ExecutionMode = ({ control, hasSchema }: Props) => {
  const { t } = useLocale('address');

  return (
    <Field>
      <FieldLabel htmlFor="mode">{t('contract.methods.execMode')}</FieldLabel>
      <FieldDescription>
        {hasSchema
          ? t('contract.methods.hasSchemaMode')
          : t('contract.methods.noSchemaMode')}
      </FieldDescription>
      <Controller
        control={control}
        name="mode"
        render={({ field }) => (
          <RadioGroup
            className="grid gap-3 md:grid-cols-2"
            onValueChange={field.onChange}
            value={field.value}
          >
            <FieldLabel htmlFor="view">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{t('contract.methods.view')}</FieldTitle>
                  <FieldDescription>
                    {t('contract.methods.viewFree')}
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem id="view" value="view" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="change">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>{t('contract.methods.change')}</FieldTitle>
                  <FieldDescription>
                    {t('contract.methods.stateAltering')}
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem id="change" value="change" />
              </Field>
            </FieldLabel>
          </RadioGroup>
        )}
      />
    </Field>
  );
};
