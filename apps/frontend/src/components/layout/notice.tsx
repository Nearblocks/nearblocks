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
    <Alert className="bg-amber-background rounded-none border-0 py-2 pl-3">
      <AlertDescription className="text-amber-foreground justify-center text-center">
        {t('notice.outOfSync')}
      </AlertDescription>
    </Alert>
  );
};
