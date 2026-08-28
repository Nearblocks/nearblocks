'use client';

import { use } from 'react';

import type { Account } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { dateFormat, toMs } from '@/lib/format';
import { Alert, AlertDescription } from '@/ui/alert';

type Props = {
  accountPromise: Promise<Account | null>;
};

export const AccountAlerts = ({ accountPromise }: Props) => {
  const account = use(accountPromise);
  const { t } = useLocale('address');

  const deletedAt = account?.deleted?.block_timestamp;
  const locked = !deletedAt && account?.locked === true;

  if (!deletedAt && !locked) return null;

  const message = deletedAt
    ? t('alerts.deleted', {
        date: dateFormat(toMs(deletedAt), 'MMM DD, YYYY HH:mm:ss'),
      })
    : t('alerts.noFullAccessKeys');

  return (
    <Alert className="bg-amber-background my-4 border-0">
      <AlertDescription className="text-body-xs text-amber-foreground block">
        {message}
      </AlertDescription>
    </Alert>
  );
};
