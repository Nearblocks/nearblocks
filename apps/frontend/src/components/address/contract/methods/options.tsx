'use client';

import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';

import { useLocale } from '@/hooks/use-locale';
import { FormData } from '@/lib/schema/contract';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/collapsible';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from '@/ui/field';
import { Input } from '@/ui/input';
import { NativeSelect, NativeSelectOption } from '@/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';

type ViewOptionsProps = {
  blockRef: 'blockId' | 'finality';
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  register: UseFormRegister<FormData>;
};

type ChangeOptionsProps = {
  errors: FieldErrors<FormData>;
  register: UseFormRegister<FormData>;
};

export const ViewOptions = ({
  blockRef,
  control,
  errors,
  register,
}: ViewOptionsProps) => {
  const { t } = useLocale('address');

  return (
    <Collapsible>
      <CollapsibleTrigger className="text-body-xs text-muted-foreground hover:text-foreground flex w-full items-center gap-2 text-left font-medium [&[data-state=open]>svg]:rotate-90">
        <svg
          className="size-4 shrink-0 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m9 18 6-6-6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t('contract.methods.options')}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-5 pt-4">
        <Field>
          <FieldLabel htmlFor="blockRef">
            {t('contract.methods.finalLabel')}
          </FieldLabel>
          <FieldDescription>{t('contract.methods.finalDesc')}</FieldDescription>
          <Controller
            control={control}
            name="blockRef"
            render={({ field }) => (
              <RadioGroup
                className="grid gap-3 md:grid-cols-2"
                onValueChange={field.onChange}
                value={field.value}
              >
                <FieldLabel htmlFor="finality">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{t('contract.methods.finality')}</FieldTitle>
                    </FieldContent>
                    <RadioGroupItem id="finality" value="finality" />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="blockId">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>
                        {t('contract.methods.finalBlockId')}
                      </FieldTitle>
                    </FieldContent>
                    <RadioGroupItem id="blockId" value="blockId" />
                  </Field>
                </FieldLabel>
              </RadioGroup>
            )}
          />
        </Field>
        {blockRef === 'finality' && (
          <Field data-invalid={!!errors.finality}>
            <FieldLabel htmlFor="finality-select">
              {t('contract.methods.finality')}
            </FieldLabel>
            <FieldDescription>
              {t('contract.methods.finalityDesc')}
            </FieldDescription>
            <Controller
              control={control}
              name="finality"
              render={({ field }) => (
                <NativeSelect onChange={field.onChange} value={field.value}>
                  <NativeSelectOption value="final">
                    {t('contract.methods.finalityFinal')}
                  </NativeSelectOption>
                  <NativeSelectOption value="near-final">
                    {t('contract.methods.finalityNearFinal')}
                  </NativeSelectOption>
                  <NativeSelectOption value="optimistic">
                    {t('contract.methods.finalityOptimistic')}
                  </NativeSelectOption>
                </NativeSelect>
              )}
            />
          </Field>
        )}
        {blockRef === 'blockId' && (
          <Field data-invalid={!!errors.blockId}>
            <FieldLabel htmlFor="blockId-input">
              {t('contract.methods.blockId')}
            </FieldLabel>
            <FieldDescription>
              {t('contract.methods.blockIdDesc')}
            </FieldDescription>
            <Input
              aria-invalid={!!errors.blockId}
              id="blockId-input"
              type="text"
              {...register('blockId')}
            />
            <FieldError errors={[errors.blockId]} />
          </Field>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const ChangeOptions = ({ errors, register }: ChangeOptionsProps) => {
  const { t } = useLocale('address');

  return (
    <div className="grid grid-cols-2 gap-4">
      <Field data-invalid={!!errors.gas}>
        <FieldLabel htmlFor="gas">{t('contract.methods.gas')}</FieldLabel>
        <Input
          aria-invalid={!!errors.gas}
          id="gas"
          type="text"
          {...register('gas')}
        />
        <FieldError errors={[errors.gas]} />
      </Field>
      <Field data-invalid={!!errors.deposit}>
        <FieldLabel htmlFor="deposit">
          {t('contract.methods.deposit')}
        </FieldLabel>
        <Input
          aria-invalid={!!errors.deposit}
          id="deposit"
          type="text"
          {...register('deposit')}
        />
        <FieldError errors={[errors.deposit]} />
      </Field>
    </div>
  );
};
