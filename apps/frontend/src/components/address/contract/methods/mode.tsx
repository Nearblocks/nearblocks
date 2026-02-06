import { Control, Controller } from 'react-hook-form';

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
  return (
    <Field>
      <FieldLabel htmlFor="mode">Execution mode</FieldLabel>
      <FieldDescription>
        {hasSchema
          ? 'Auto-selected based on schema. You can override if needed.'
          : "We can't differentiate read/write methods for this contract, so you should choose the appropriate action"}
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
                  <FieldTitle>View</FieldTitle>
                  <FieldDescription>
                    Free, read-only data queries
                  </FieldDescription>
                </FieldContent>
                <RadioGroupItem id="view" value="view" />
              </Field>
            </FieldLabel>
            <FieldLabel htmlFor="change">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>Change</FieldTitle>
                  <FieldDescription>
                    State-altering transactions
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
