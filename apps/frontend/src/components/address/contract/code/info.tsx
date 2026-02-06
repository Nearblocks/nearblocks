import { Link } from '@/components/link';
import { Alert, AlertDescription } from '@/ui/alert';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  account: string;
  isNep330: boolean;
  isVerified: boolean;
  loading: boolean;
};

export const Info = ({ account, isNep330, isVerified, loading }: Props) => {
  if (loading) return <Skeleton className="mb-4 h-11 w-full" />;
  if (!isNep330) return null;

  if (!isVerified)
    return (
      <Alert className="bg-amber-background mb-3 border-0">
        <AlertDescription className="text-amber-foreground text-body-xs inline-block">
          Are you the contract owner?{' '}
          <Link
            className="font-bold underline"
            href={`/verify-contract?account=${account}`}
          >
            Verify and Publish
          </Link>{' '}
          your contract source code today!
        </AlertDescription>
      </Alert>
    );

  return (
    <Alert className="bg-teal-background mb-3 border-0">
      <AlertDescription className="text-teal-foreground text-body-xs block">
        Contract Source Code Verified
      </AlertDescription>
    </Alert>
  );
};
