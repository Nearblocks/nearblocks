'use client';

import { Link } from '@/components/link';
import { useLocale } from '@/hooks/use-locale';
import { Alert, AlertDescription } from '@/ui/alert';

type Props = {
  account: string;
  isNep330: boolean;
  isVerified: boolean;
};

export const Info = ({ account, isNep330, isVerified }: Props) => {
  const { t } = useLocale('address');
  if (!isNep330) return null;

  if (!isVerified)
    return (
      <Alert className="mb-3 border-0 bg-amber-background">
        <AlertDescription className="inline-block text-body-xs text-amber-foreground">
          {t('contract.code.owner')}{' '}
          <Link
            className="font-bold underline"
            href={`/verify-contract?account=${account}`}
          >
            {t('contract.code.publish')}
          </Link>{' '}
          {t('contract.code.publishSuffix')}
        </AlertDescription>
      </Alert>
    );

  return (
    <Alert className="mb-3 border-0 bg-teal-background">
      <AlertDescription className="block text-body-xs text-teal-foreground">
        {t('contract.code.verified')}
      </AlertDescription>
    </Alert>
  );
};
