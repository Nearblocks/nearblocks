import { useForm } from 'react-hook-form';

import { rpcProviderSchema, type RpcProviderValues } from '@/lib/schema/rpc';
import { zodResolver } from '@/lib/zod';
import { Button } from '@/ui/button';
import { Field, FieldContent, FieldError, FieldLabel } from '@/ui/field';
import { Input } from '@/ui/input';

type Props = {
  defaultValues?: RpcProviderValues;
  existingUrls?: string[];
  onCancel: () => void;
  onSubmit: (values: RpcProviderValues) => void;
};

export const RpcProviderForm = ({
  defaultValues,
  existingUrls,
  onCancel,
  onSubmit,
}: Props) => {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<RpcProviderValues>({
    defaultValues,
    resolver: zodResolver(rpcProviderSchema),
  });

  const handleValidatedSubmit = (values: RpcProviderValues) => {
    if (existingUrls?.includes(values.url)) {
      setError('url', {
        message: 'This URL is already in use',
        type: 'custom',
      });
      return;
    }
    onSubmit(values);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleValidatedSubmit)}>
      <Field data-invalid={!!errors.name}>
        <FieldLabel className="text-muted-foreground" htmlFor="rpc-name">
          Name
        </FieldLabel>
        <FieldContent>
          <Input
            aria-invalid={!!errors.name}
            id="rpc-name"
            {...register('name')}
          />
          <FieldError errors={errors.name ? [errors.name] : []} />
        </FieldContent>
      </Field>
      <Field data-invalid={!!errors.url}>
        <FieldLabel className="text-muted-foreground" htmlFor="rpc-url">
          URL
        </FieldLabel>
        <FieldContent>
          <Input
            aria-invalid={!!errors.url}
            id="rpc-url"
            placeholder="https://"
            {...register('url')}
          />
          <FieldError errors={errors.url ? [errors.url] : []} />
        </FieldContent>
      </Field>
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancel
        </Button>
        <Button type="submit" variant="secondary">
          Save
        </Button>
      </div>
    </form>
  );
};
