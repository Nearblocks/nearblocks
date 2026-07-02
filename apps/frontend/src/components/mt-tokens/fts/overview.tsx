'use client';

import { use } from 'react';

import {
  MTTokenHolderCountRes,
  MTTokenRes,
  MTTokenTxnCountRes,
} from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { countFormat, currencyFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  holderCountPromise?: Promise<MTTokenHolderCountRes>;
  loading?: boolean;
  tokenPromise?: Promise<MTTokenRes>;
  txnCountPromise?: Promise<MTTokenTxnCountRes>;
};

export const MtFtOverview = ({
  holderCountPromise,
  loading,
  tokenPromise,
  txnCountPromise,
}: Props) => {
  const { t } = useLocale('mts');
  const tokenRes = !loading && tokenPromise ? use(tokenPromise) : null;
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;
  const holderCount =
    !loading && holderCountPromise ? use(holderCountPromise) : null;
  const token = tokenRes?.data ?? null;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('contract.overview.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        {(token?.price || loading) && (
          <>
            <List pairsPerRow={1}>
              <ListItem>
                <ListLeft className="min-w-36">{t('token.price')}</ListLeft>
                <ListRight>
                  <SkeletonSlot
                    fallback={<Skeleton className="w-24" />}
                    loading={loading || !token}
                  >
                    {() => (
                      <span className="text-body-sm">
                        {token?.price ? currencyFormat(token.price) : 'N/A'}
                      </span>
                    )}
                  </SkeletonSlot>
                </ListRight>
              </ListItem>
            </List>
            <hr className="border-border" />
          </>
        )}
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-36">{t('token.decimals')}</ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-8" />}
                loading={loading || !token}
              >
                {() => (
                  <span className="text-body-sm">
                    {token?.decimals != null ? token.decimals : 'N/A'}
                  </span>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-36">
              {t('contract.overview.holders')}
            </ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-20" />}
                loading={loading || !holderCount}
              >
                {() => (
                  <span className="text-body-sm">
                    {holderCount?.data?.count
                      ? numberFormat(holderCount.data.count)
                      : 'N/A'}
                  </span>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-36">
              {t('contract.overview.transfers')}
            </ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-20" />}
                loading={loading || !txnCount}
              >
                {() => (
                  <span className="text-body-sm">
                    {txnCount?.data?.count
                      ? countFormat(txnCount.data.count)
                      : 'N/A'}
                  </span>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
