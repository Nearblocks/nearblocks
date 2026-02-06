import { Control, Controller, FieldErrors } from 'react-hook-form';
import { RiQuestionLine } from 'react-icons/ri';

import { JsonEditor } from '@/components/json-editor';
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
  return (
    <Field data-invalid={!!errors.args}>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor="args">Arguments</FieldLabel>
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
                Auto detect <RiQuestionLine className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Scan the blockchain to find successful method calls and copy the
              parameter schema. Auto-detect might not work on every method.
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <FieldDescription>
        {hasSchema
          ? 'JSON arguments for the method call'
          : 'Specify an arguments JSON schema'}
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
