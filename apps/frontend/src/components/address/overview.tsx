'use client';

import { RiCoinsLine } from '@remixicon/react';
import { useParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountAssetFT,
  AccountAssetMTFT,
  AccountBalance,
  Stats,
} from 'nb-schemas';

import { ErrorSuspense } from '@/components/error-suspense';
import { Link } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { currencyFormat, nearFiatFormat, nearFormat } from '@/lib/format';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { Tokens } from './tokens';

type Props = {
  balancePromise?: Promise<AccountBalance | null>;
  loading?: boolean;
  mtTokensPromise?: Promise<AccountAssetMTFT[] | null>;
  spamPatterns?: string[];
  statsPromise?: Promise<null | Stats>;
  tokensPromise?: Promise<AccountAssetFT[] | null>;
};

export const Overview = ({
  balancePromise,
  loading,
  mtTokensPromise,
  spamPatterns,
  statsPromise,
  tokensPromise,
}: Props) => {
  const { t } = useLocale('address');
  const network = useConfig((s) => s.config.network);
  const stats = !loading && statsPromise ? use(statsPromise) : null;
  const balance = !loading && balancePromise ? use(balancePromise) : null;
  const { address } = useParams<{ address: string }>();

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('overview.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-1">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="min-w-20">{t('overview.balance')}</ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <NearCircle className="size-4" />{' '}
                <SkeletonSlot
                  fallback={
                    <span className="block">
                      <Skeleton className="w-20" />
                    </span>
                  }
                  loading={!!loading}
                >
                  {() =>
                    balance ? (
                      <>{nearFormat(balance.amount)}</>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )
                  }
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          {network === 'mainnet' && (
            <ListItem>
              <ListLeft className="min-w-20">{t('overview.value')}</ListLeft>
              <ListRight>
                <p className="flex flex-wrap items-center gap-1">
                  <SkeletonSlot
                    fallback={
                      <span className="block">
                        <Skeleton className="w-20" />
                      </span>
                    }
                    loading={!!loading}
                  >
                    {() =>
                      balance && stats ? (
                        <>
                          <span>
                            {nearFiatFormat(balance.amount, stats.near_price)}
                          </span>
                          <span className="text-muted-foreground inline-flex items-center gap-1">
                            @{currencyFormat(stats.near_price)} /
                            <NearCircle className="size-4" />
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )
                    }
                  </SkeletonSlot>
                </p>
              </ListRight>
            </ListItem>
          )}
          <ListItem>
            <ListLeft className="min-w-20">{t('overview.tokens')}</ListLeft>
            <ListRight className="xl:py-2">
              <div className="flex w-full items-center gap-2">
                <div className="min-w-0 flex-1">
                  <ErrorSuspense fallback={<Tokens loading />}>
                    <Tokens
                      mtTokensPromise={mtTokensPromise}
                      spamPatterns={spamPatterns}
                      tokensPromise={tokensPromise}
                    />
                  </ErrorSuspense>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild size="icon" variant="outline">
                      <Link href={`/address/${address}/assets`}>
                        <RiCoinsLine />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('overview.viewAssets')}</TooltipContent>
                </Tooltip>
              </div>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
