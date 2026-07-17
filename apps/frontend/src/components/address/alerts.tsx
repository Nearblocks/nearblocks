'use client';

import { use } from 'react';

import type { Account, Contract } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { dateFormat, toMs } from '@/lib/format';
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
  const noKeys = !deletedAt && account?.locked === true && contract === null;

  if (!deletedAt && !noKeys) return null;

  const message = deletedAt
    ? t('alerts.deleted', {
        date: dateFormat(toMs(deletedAt), 'MMM DD, YYYY HH:mm:ss'),
      })
    : t('alerts.noFullAccessKeys');

  return (
    <Alert className="bg-amber-background my-4 border-0">
      <AlertDescription className="text-amber-foreground text-body-xs block">
        {message}
      </AlertDescription>
    </Alert>
  );
};
