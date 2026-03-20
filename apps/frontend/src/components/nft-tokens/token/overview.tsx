'use client';

import { use } from 'react';

import {
  NFTContractHolderCountRes,
  NFTContractRes,
  NFTContractTxnCountRes,
} from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  contractPromise?: Promise<NFTContractRes>;
  holderCountPromise?: Promise<NFTContractHolderCountRes>;
  loading?: boolean;
  txCountPromise?: Promise<NFTContractTxnCountRes>;
};

export const Overview = ({
  contractPromise,
  holderCountPromise,
  loading,
  txCountPromise,
}: Props) => {
  const { t } = useLocale('nfts');
  const result = !loading && contractPromise ? use(contractPromise) : null;
  const contract = result?.data ?? null;
  const holderCount =
    !loading && holderCountPromise ? use(holderCountPromise) : null;
  const txCount = !loading && txCountPromise ? use(txCountPromise) : null;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('contract.overview.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-36">
              {t('contract.overview.totalSupply')}
            </ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-28" />}
                loading={loading || !contract}
              >
                {() => (
                  <>
                    {contract?.tokens ? (
                      numberFormat(contract.tokens, {
                        maximumFractionDigits: 0,
                      })
                    ) : (
                      <span className="text-muted-foreground">
                        {t('contract.overview.na')}
                      </span>
                    )}
                  </>
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
                  <>
                    {holderCount?.data?.count ? (
                      numberFormat(holderCount.data.count)
                    ) : (
                      <span className="text-muted-foreground">
                        {t('contract.overview.na')}
                      </span>
                    )}
                  </>
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
                loading={loading || !txCount}
              >
                {() => (
                  <>
                    {txCount?.data?.count ? (
                      numberFormat(txCount.data.count)
                    ) : (
                      <span className="text-muted-foreground">
                        {t('contract.overview.na')}
                      </span>
                    )}
                  </>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
