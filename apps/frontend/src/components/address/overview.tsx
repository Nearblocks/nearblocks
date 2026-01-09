'use client';

import { use } from 'react';

import { AccountAssetFTsRes, AccountBalanceRes, StatsRes } from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
// import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { currencyFormat, nearFiatFormat, nearFormat } from '@/lib/format';
import { TokensCacheRes } from '@/types/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { ErrorSuspense } from '../error-suspense';
import { SkeletonSlot } from '../skeleton';
import { Tokens } from './tokens';

type Props = {
  balancePromise?: Promise<AccountBalanceRes['data']>;
  loading?: boolean;
  statsPromise?: Promise<StatsRes['data']>;
  tokenCachePromise?: Promise<TokensCacheRes['tokens']>;
  tokensPromise?: Promise<AccountAssetFTsRes['data']>;
};

export const Overview = ({
  balancePromise,
  loading,
  statsPromise,
  tokenCachePromise,
  tokensPromise,
}: Props) => {
  // const { t } = useLocale('address');
  const stats = !loading && statsPromise ? use(statsPromise) : null;
  const balance = !loading && balancePromise ? use(balancePromise) : null;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-20">Balance:</ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <NearCircle className="size-4" />{' '}
                <SkeletonSlot
                  fallback={<Skeleton className="w-20" />}
                  loading={loading || !balance}
                >
                  {() => <>{nearFormat(balance!.amount)}</>}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-20">Value:</ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="w-20" />}
                  loading={loading || !balance || !stats}
                >
                  {() => (
                    <>
                      {nearFiatFormat(balance!.amount, stats!.near_price)} (@
                      {currencyFormat(stats!.near_price)} /{' '}
                      <NearCircle className="size-4" />)
                    </>
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-20">Tokens:</ListLeft>
            <ListRight className="xl:py-2">
              <ErrorSuspense fallback={<Tokens loading />}>
                <Tokens
                  tokenCachePromise={tokenCachePromise}
                  tokensPromise={tokensPromise}
                />
              </ErrorSuspense>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
