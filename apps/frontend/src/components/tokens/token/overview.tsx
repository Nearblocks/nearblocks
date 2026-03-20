'use client';

import { use } from 'react';

import {
  FTContractHolderCountRes,
  FTContractRes,
  FTContractTxnCountRes,
} from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { PriceChange } from '@/components/price-change';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  contractPromise?: Promise<FTContractRes>;
  holderCountPromise?: Promise<FTContractHolderCountRes>;
  loading?: boolean;
  txCountPromise?: Promise<FTContractTxnCountRes>;
};

export const Overview = ({
  contractPromise,
  holderCountPromise,
  loading,
  txCountPromise,
}: Props) => {
  const { t } = useLocale('fts');
  const result = !loading && contractPromise ? use(contractPromise) : null;
  const contract = result?.data ?? null;
  const holderCount =
    !loading && holderCountPromise ? use(holderCountPromise) : null;
  const txCount = !loading && txCountPromise ? use(txCountPromise) : null;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('overview.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <List pairsPerRow={2}>
          <ListItem>
            <div>
              <ListLeft className="min-w-81 pb-0!">
                {t('overview.price')}
              </ListLeft>
              <ListRight className="pt-0!">
                <SkeletonSlot
                  fallback={<Skeleton className="h-6 w-28" />}
                  loading={loading || !contract}
                >
                  {() => (
                    <span className="text-body-xs flex items-center gap-1">
                      {contract?.price ? (
                        <>
                          {currencyFormat(contract.price)}
                          {contract.change_24h && (
                            <PriceChange change={contract.change_24h} />
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </span>
                  )}
                </SkeletonSlot>
              </ListRight>
            </div>
          </ListItem>
          <ListItem>
            <div>
              <ListLeft className="min-w-81 pb-0!">
                {t('overview.circulatingMC')}
              </ListLeft>
              <ListRight className="pt-0!">
                <SkeletonSlot
                  fallback={<Skeleton className="w-28" />}
                  loading={loading || !contract}
                >
                  {() => (
                    <>
                      {contract?.market_cap &&
                      parseFloat(contract.market_cap) > 0 ? (
                        currencyFormat(contract.market_cap, {
                          maximumFractionDigits: 0,
                        })
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </>
                  )}
                </SkeletonSlot>
              </ListRight>
            </div>
          </ListItem>
        </List>
        <Separator />
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-36">
              {t('overview.totalSupply')}
            </ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-28" />}
                loading={loading || !contract}
              >
                {() => (
                  <>
                    {contract?.total_supply ? (
                      numberFormat(contract.total_supply, {
                        maximumFractionDigits: 0,
                      })
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-36">{t('overview.holders')}</ListLeft>
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
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-36">{t('overview.transfers')}</ListLeft>
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
                      <span className="text-muted-foreground">N/A</span>
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
