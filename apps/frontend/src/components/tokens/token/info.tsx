'use client';

import { use } from 'react';

import { FTContractRes } from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { currencyFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Separator } from '@/ui/separator';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  contractPromise?: Promise<FTContractRes>;
  loading?: boolean;
};

export const TokenInfo = ({ contractPromise, loading }: Props) => {
  const result = !loading && contractPromise ? use(contractPromise) : null;
  const contract = result?.data ?? null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        {(loading || contract?.description) && (
          <>
            <CardHeader className="border-b py-3">
              <CardTitle className="text-headline-sm">Overview</CardTitle>
            </CardHeader>
            <CardContent className="py-3">
              <SkeletonSlot
                fallback={<Skeleton className="h-18 w-full" />}
                loading={loading || !contract}
              >
                {() => (
                  <p className="text-muted-foreground text-body-sm">
                    {contract!.description}
                  </p>
                )}
              </SkeletonSlot>
            </CardContent>
            <Separator />
          </>
        )}
        <CardHeader className="border-b py-3">
          <CardTitle className="text-headline-sm">Market</CardTitle>
        </CardHeader>
        <CardContent className="px-3">
          <List pairsPerRow={2}>
            <ListItem>
              <ListLeft className="min-w-36">Market Cap:</ListLeft>
              <ListRight>
                <SkeletonSlot
                  fallback={<Skeleton className="w-24" />}
                  loading={loading || !contract}
                >
                  {() =>
                    contract?.market_cap && +contract.market_cap > 0 ? (
                      currencyFormat(contract.market_cap, {
                        maximumFractionDigits: 0,
                      })
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
                </SkeletonSlot>
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft className="min-w-36">On-chain Market Cap:</ListLeft>
              <ListRight>
                <SkeletonSlot
                  fallback={<Skeleton className="w-24" />}
                  loading={loading || !contract}
                >
                  {() =>
                    contract?.onchain_market_cap &&
                    +contract.onchain_market_cap > 0 ? (
                      currencyFormat(contract.onchain_market_cap, {
                        maximumFractionDigits: 0,
                      })
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
                </SkeletonSlot>
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft className="min-w-36">
                Fully Diluted Market Cap:
              </ListLeft>
              <ListRight>
                <SkeletonSlot
                  fallback={<Skeleton className="w-24" />}
                  loading={loading || !contract}
                >
                  {() =>
                    contract?.fully_diluted_market_cap &&
                    +contract.fully_diluted_market_cap > 0 ? (
                      currencyFormat(contract.fully_diluted_market_cap, {
                        maximumFractionDigits: 0,
                      })
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
                </SkeletonSlot>
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft className="min-w-36">24h Volume:</ListLeft>
              <ListRight>
                <SkeletonSlot
                  fallback={<Skeleton className="w-24" />}
                  loading={loading || !contract}
                >
                  {() =>
                    contract?.volume_24h && +contract.volume_24h > 0 ? (
                      currencyFormat(contract.volume_24h, {
                        maximumFractionDigits: 0,
                      })
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
                </SkeletonSlot>
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft className="min-w-36">Circulating Supply:</ListLeft>
              <ListRight>
                <SkeletonSlot
                  fallback={<Skeleton className="w-28" />}
                  loading={loading || !contract}
                >
                  {() =>
                    contract?.circulating_supply &&
                    +contract.circulating_supply > 0 ? (
                      numberFormat(contract.circulating_supply, {
                        maximumFractionDigits: 0,
                      })
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
                </SkeletonSlot>
              </ListRight>
            </ListItem>
            <ListItem>
              <ListLeft className="min-w-36">Total Supply:</ListLeft>
              <ListRight>
                <SkeletonSlot
                  fallback={<Skeleton className="w-28" />}
                  loading={loading || !contract}
                >
                  {() =>
                    contract?.total_supply && +contract.total_supply > 0 ? (
                      numberFormat(contract.total_supply, {
                        maximumFractionDigits: 0,
                      })
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
                </SkeletonSlot>
              </ListRight>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </div>
  );
};
