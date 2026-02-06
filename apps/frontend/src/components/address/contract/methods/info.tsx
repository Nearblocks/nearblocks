import { Alert, AlertDescription } from '@/ui/alert';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  hasSchema: boolean;
  loading: boolean;
};

export const Info = ({ hasSchema, loading }: Props) => {
  if (loading) return <Skeleton className="mb-3 h-11 w-full" />;

  if (hasSchema)
    return (
      <Alert className="bg-teal-background mb-3 border-0">
        <AlertDescription className="text-teal-foreground text-body-xs inline-block">
          Methods and arguments are automatically shown from the embedded{' '}
          <a
            className="font-bold underline"
            href="https://github.com/near/abi"
            rel="noopener noreferrer"
            target="_blank"
          >
            Near ABI
          </a>{' '}
          schema
        </AlertDescription>
      </Alert>
    );

  return (
    <Alert className="bg-amber-background mb-3 border-0">
      <AlertDescription className="text-amber-foreground text-body-xs block">
        Near ABI schema not found. If you are the contract owner, please
        consider recompiling your contract with{' '}
        <a
          className="font-bold underline"
          href="https://github.com/near/abi"
          rel="noopener noreferrer"
          target="_blank"
        >
          Near ABI
        </a>
      </AlertDescription>
    </Alert>
  );
};
