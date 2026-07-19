'use client';

import { use } from 'react';

import { MCMpcParametersRes, SignerTotalStats } from 'nb-schemas';

import { AccountLink } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useLocale } from '@/hooks/use-locale';
import { gasFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  mpcsPromise?: Promise<MCMpcParametersRes>;
  totalStatsPromise?: Promise<null | SignerTotalStats>;
};

export const Overview = ({
  loading,
  mpcsPromise,
  totalStatsPromise,
}: Props) => {
  const { t } = useLocale('chainSignatures');
  const mpcsRes = !loading && mpcsPromise ? use(mpcsPromise) : null;
  if (mpcsRes?.errors?.length) throw new Error('Failed to load MPC network');
  const mpcs = mpcsRes?.data ?? null;
  const totalStats =
    !loading && totalStatsPromise ? use(totalStatsPromise) : null;

  const isMpcsLoading = !!loading;
  const isStatsLoading = !!loading;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="border-b py-3">
          <CardTitle className="text-headline-sm">
            {t('overview.network.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-1">
          <List pairsPerRow={1}>
            <ListItem>
              <ListLeft>{t('overview.network.totalOperators')}</ListLeft>
              <ListRight>
                {isMpcsLoading ? (
                  <Skeleton className="w-10" />
                ) : mpcs ? (
                  numberFormat(mpcs.participants.length)
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft>{t('overview.network.threshold')}</ListLeft>
              <ListRight>
                {isMpcsLoading ? (
                  <Skeleton className="w-14" />
                ) : mpcs ? (
                  `${mpcs.threshold} / ${mpcs.participants.length}`
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </ListRight>
            </ListItem>
          </List>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="border-b py-3">
          <CardTitle className="text-headline-sm">
            {t('overview.activity.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-1">
          <List pairsPerRow={1}>
            <ListItem>
              <ListLeft>{t('overview.activity.contract')}</ListLeft>
              <ListRight>
                {isMpcsLoading ? (
                  <span className="flex h-7 items-center">
                    <Skeleton className="w-30" />
                  </span>
                ) : mpcs ? (
                  <AccountLink account={mpcs.contract} />
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft>{t('overview.activity.totalTxns')}</ListLeft>
              <ListRight>
                {isStatsLoading ? (
                  <Skeleton className="w-20" />
                ) : totalStats ? (
                  numberFormat(totalStats.txns)
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft>{t('overview.activity.totalGasBurnt')}</ListLeft>
              <ListRight>
                {isStatsLoading ? (
                  <Skeleton className="w-20" />
                ) : totalStats?.gas_burnt ? (
                  `${gasFormat(totalStats.gas_burnt, {
                    notation: 'compact',
                  })} Tgas`
                ) : (
                  ''
                )}
              </ListRight>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </div>
  );
};
