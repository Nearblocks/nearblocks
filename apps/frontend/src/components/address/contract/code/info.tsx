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
      <Alert className="bg-amber-background mb-3 border-0">
        <AlertDescription className="text-amber-foreground text-body-xs inline-block">
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
    <Alert className="bg-teal-background mb-3 border-0">
      <AlertDescription className="text-teal-foreground text-body-xs block">
        {t('contract.code.verified')}
      </AlertDescription>
    </Alert>
  );
};
