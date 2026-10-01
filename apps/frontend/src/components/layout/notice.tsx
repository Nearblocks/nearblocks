'use client';

import { use } from 'react';

import type { BlockStatus } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { Alert, AlertDescription } from '@/ui/alert';

type Props = {
  syncStatusPromise: Promise<BlockStatus | null>;
};

export const Notice = ({ syncStatusPromise }: Props) => {
  const { t } = useLocale('layout');
  const syncStatus = use(syncStatusPromise);

  if (!syncStatus || syncStatus.sync) return null;

  return (
    <Alert className="rounded-none border-0 bg-amber-background py-2 pl-3">
      <AlertDescription className="justify-center text-center text-amber-foreground">
        {t('notice.outOfSync')}
      </AlertDescription>
    </Alert>
  );
};
