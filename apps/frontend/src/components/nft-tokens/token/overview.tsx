'use client';

import { use } from 'react';

import {
  NFTContractHolderCountRes,
  NFTContractRes,
  NFTContractTxnCountRes,
} from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
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
  const result = !loading && contractPromise ? use(contractPromise) : null;
  const contract = result?.data ?? null;
  const holderCount =
    !loading && holderCountPromise ? use(holderCountPromise) : null;
  const txCount = !loading && txCountPromise ? use(txCountPromise) : null;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">Overview</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-36">Total Supply:</ListLeft>
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
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-36">Holders:</ListLeft>
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
            <ListLeft className="min-w-36">Transfers:</ListLeft>
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
