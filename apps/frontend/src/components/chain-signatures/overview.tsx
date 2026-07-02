'use client';

import { use } from 'react';

import { MCMpcParameters, SignerTotalStats } from 'nb-schemas';

import { AccountLink } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { useLocale } from '@/hooks/use-locale';
import { gasFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  mpcsPromise?: Promise<MCMpcParameters | null>;
  totalStatsPromise?: Promise<null | SignerTotalStats>;
};

export const Overview = ({
  loading,
  mpcsPromise,
  totalStatsPromise,
}: Props) => {
  const { t } = useLocale('chainSignatures');
  const mpcs = !loading && mpcsPromise ? use(mpcsPromise) : null;
  const totalStats =
    !loading && totalStatsPromise ? use(totalStatsPromise) : null;

  const isMpcsLoading = loading || !mpcs;
  const isStatsLoading = loading || !totalStats;

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
                  <Skeleton className="h-4 w-10" />
                ) : (
                  numberFormat(mpcs!.participants.length)
                )}
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft>{t('overview.network.threshold')}</ListLeft>
              <ListRight>
                {isMpcsLoading ? (
                  <Skeleton className="h-4 w-14" />
                ) : (
                  `${mpcs!.threshold} / ${mpcs!.participants.length}`
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
                  <Skeleton className="h-4 w-30" />
                ) : (
                  <AccountLink account={mpcs!.contract} />
                )}
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft>{t('overview.activity.totalTxns')}</ListLeft>
              <ListRight>
                {isStatsLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  numberFormat(totalStats!.txns)
                )}
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft>{t('overview.activity.totalGasBurnt')}</ListLeft>
              <ListRight>
                {isStatsLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : totalStats!.gas_burnt ? (
                  `${gasFormat(totalStats!.gas_burnt, {
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
