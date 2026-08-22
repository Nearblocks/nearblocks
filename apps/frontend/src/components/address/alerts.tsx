'use client';

import { use } from 'react';

import type { Account, Contract } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { dateFormat, toMs } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/ui/alert';

type Props = {
  accountPromise: Promise<Account | null>;
  contractPromise: Promise<Contract | null>;
};

export const AccountAlerts = ({ accountPromise, contractPromise }: Props) => {
  const account = use(accountPromise);
  const contract = use(contractPromise);
  const { t } = useLocale('address');

  const deletedAt = account?.deleted?.block_timestamp;
  const locked = !deletedAt && account?.locked === true;
  const lockedContract = locked && contract !== null;

  if (!deletedAt && !locked) return null;

  let message = t('alerts.noFullAccessKeys');

  if (deletedAt) {
    message = t('alerts.deleted', {
      date: dateFormat(toMs(deletedAt), 'MMM DD, YYYY HH:mm:ss'),
    });
  } else if (lockedContract) {
    message = t('alerts.lockedContract');
  }

  return (
    <Alert
      className={cn(
        'my-4 border-0',
        lockedContract ? 'bg-blue-background' : 'bg-amber-background',
      )}
    >
      <AlertDescription
        className={cn(
          'text-body-xs block',
          lockedContract ? 'text-blue-foreground' : 'text-amber-foreground',
        )}
      >
        {message}
      </AlertDescription>
    </Alert>
  );
};
