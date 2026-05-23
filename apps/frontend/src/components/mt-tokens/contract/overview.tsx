'use client';

import { use } from 'react';

import { MTContractTxnCountRes, MTTokenCountRes } from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { countFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  tokenCountPromise?: Promise<MTTokenCountRes>;
  txCountPromise?: Promise<MTContractTxnCountRes>;
};

export const Overview = ({
  loading,
  tokenCountPromise,
  txCountPromise,
}: Props) => {
  const { t } = useLocale('mts');
  const tokenCount =
    !loading && tokenCountPromise ? use(tokenCountPromise) : null;
  const txCount = !loading && txCountPromise ? use(txCountPromise) : null;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('contract.overview.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-36">
              {t('contract.overview.tokens')}
            </ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="w-20" />}
                loading={loading || !tokenCount}
              >
                {() => (
                  <>
                    {tokenCount?.data?.count ? (
                      numberFormat(tokenCount.data.count)
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
                      countFormat(txCount.data.count)
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
