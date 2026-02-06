import { Control, Controller, FieldErrors } from 'react-hook-form';

import { SkeletonSlot } from '@/components/skeleton';
import { FormData } from '@/lib/schema/contract';
import { Button } from '@/ui/button';
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
} from '@/ui/combobox';
import { Field, FieldError, FieldLabel } from '@/ui/field';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  control: Control<FormData>;
  errors: FieldErrors<FormData>;
  groupedMethods: { items: string[]; value: string }[];
  hasSchema: boolean;
  loading: boolean;
  methods: string[];
  onMethodChange: (value: null | string) => void;
};

export const MethodSelector = ({
  control,
  errors,
  groupedMethods,
  hasSchema,
  loading,
  methods,
  onMethodChange,
}: Props) => {
  return (
    <Field data-invalid={!!errors.method}>
      <FieldLabel htmlFor="method">Method</FieldLabel>
      <SkeletonSlot
        fallback={<Skeleton className="h-9 w-full" />}
        loading={loading}
      >
        {() => (
          <Controller
            control={control}
            name="method"
            render={({ field }) => (
              <Combobox
                items={hasSchema ? groupedMethods : methods}
                onValueChange={(value) => {
                  field.onChange(value ?? '');
                  onMethodChange(value);
                }}
                value={field.value}
              >
                <ComboboxTrigger
                  onBlur={field.onBlur}
                  render={
                    <Button
                      aria-invalid={!!errors.method}
                      className="aria-invalid:border-destructive w-full justify-between bg-transparent font-normal"
                      variant="outline"
                    >
                      {field.value ? (
                        <ComboboxValue />
                      ) : (
                        <span className="text-muted-foreground">
                          Select a method
                        </span>
                      )}
                    </Button>
                  }
                />
                <ComboboxContent className="min-w-(--anchor-width)">
                  <ComboboxInput
                    placeholder="Search methods..."
                    showTrigger={false}
                  />
                  <ComboboxEmpty>No methods found.</ComboboxEmpty>
                  <ComboboxList className="scroll-overlay max-h-47.5 overflow-y-auto">
                    {hasSchema
                      ? (group, index) => (
                          <ComboboxGroup items={group.items} key={group.value}>
                            <ComboboxLabel>{group.value}</ComboboxLabel>
                            <ComboboxCollection>
                              {(item) => (
                                <ComboboxItem key={item} value={item}>
                                  {item}
                                </ComboboxItem>
                              )}
                            </ComboboxCollection>
                            {index < groupedMethods.length - 1 && (
                              <ComboboxSeparator />
                            )}
                          </ComboboxGroup>
                        )
                      : (item) => (
                          <ComboboxItem key={item} value={item}>
                            {item}
                          </ComboboxItem>
                        )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            )}
          />
        )}
      </SkeletonSlot>
      <FieldError errors={[errors.method]} />
    </Field>
  );
};
