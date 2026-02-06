import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';

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
        Advanced options
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-5 pt-4">
        <Field>
          <FieldLabel htmlFor="blockRef">Block reference</FieldLabel>
          <FieldDescription>
            Query state at a specific block or finality level
          </FieldDescription>
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
                      <FieldTitle>Finality</FieldTitle>
                    </FieldContent>
                    <RadioGroupItem id="finality" value="finality" />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="blockId">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Block ID</FieldTitle>
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
            <FieldLabel htmlFor="finality-select">Finality</FieldLabel>
            <FieldDescription>
              Select finality level for the query
            </FieldDescription>
            <Controller
              control={control}
              name="finality"
              render={({ field }) => (
                <NativeSelect onChange={field.onChange} value={field.value}>
                  <NativeSelectOption value="final">Final</NativeSelectOption>
                  <NativeSelectOption value="near-final">
                    Near Final
                  </NativeSelectOption>
                  <NativeSelectOption value="optimistic">
                    Optimistic
                  </NativeSelectOption>
                </NativeSelect>
              )}
            />
          </Field>
        )}
        {blockRef === 'blockId' && (
          <Field data-invalid={!!errors.blockId}>
            <FieldLabel htmlFor="blockId-input">Block ID</FieldLabel>
            <FieldDescription>
              Enter block height or block hash
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
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field data-invalid={!!errors.gas}>
        <FieldLabel htmlFor="gas">Gas (Tgas)</FieldLabel>
        <Input
          aria-invalid={!!errors.gas}
          id="gas"
          type="text"
          {...register('gas')}
        />
        <FieldError errors={[errors.gas]} />
      </Field>
      <Field data-invalid={!!errors.deposit}>
        <FieldLabel htmlFor="deposit">Deposit (NEAR)</FieldLabel>
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
