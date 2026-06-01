'use client';

import { RiCloseLine } from '@remixicon/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';
import useSWR from 'swr';

import { FTContractRes } from 'nb-schemas';

import { getCachedTokenBalance } from '@/actions/token-cache';
import { AccountLink } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { useView } from '@/hooks/use-rpc';
import {
  currencyFormat,
  numberFormat,
  toTokenAmount,
  toTokenPrice,
} from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  cid: string;
  contractPromise: Promise<FTContractRes>;
};

export const HolderFilter = ({ cid, contractPromise }: Props) => {
  const { t } = useLocale('fts');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const account = searchParams.get('account');

  const result = use(contractPromise);
  const contract = result?.data ?? null;

  const { data: cachedBalance, isLoading: cacheLoading } = useSWR(
    account ? ['token-cache-balance', account, cid] : null,
    () => getCachedTokenBalance(account as string, cid),
  );

  const cacheUnavailable = !cacheLoading && cachedBalance === null;

  const { data: rpcBalance, isLoading: rpcLoading } = useView<string>(
    account && cacheUnavailable
      ? {
          args: { account_id: account },
          contract: cid,
          method: 'ft_balance_of',
        }
      : null,
  );

  if (!account) return null;

  const rawBalance = cachedBalance ?? rpcBalance ?? null;
  const decimals = contract?.decimals ?? 0;
  const price = contract?.price ?? '0';
  const hasPrice = parseFloat(price) > 0;
  const loading =
    rawBalance === null && (cacheLoading || (cacheUnavailable && rpcLoading));

  const params = new URLSearchParams(searchParams.toString());
  params.delete('account');
  const closeHref =
    params.size > 0 ? `${pathname}?${params.toString()}` : pathname;

  return (
    <Card className="mb-4">
      <CardContent className="flex flex-col divide-y px-0 md:flex-row md:divide-x md:divide-y-0">
        <div className="flex-1 px-4 py-3">
          <div className="text-muted-foreground text-body-xs mb-2 uppercase">
            {t('overview.filteredBy')}
          </div>
          <div className="text-body-sm flex items-center gap-1">
            <AccountLink account={account} hideCopy />
            <Link
              className="text-muted-foreground hover:text-foreground"
              href={closeHref}
            >
              <RiCloseLine className="size-4" />
            </Link>
          </div>
        </div>
        <div className="flex-1 px-4 py-3">
          <div className="text-muted-foreground text-body-xs mb-2 uppercase">
            {t('overview.balance')}
          </div>
          <SkeletonSlot
            fallback={<Skeleton className="h-5 w-32" />}
            loading={loading}
          >
            {() =>
              rawBalance !== null ? (
                <span className="text-body-sm">
                  {numberFormat(toTokenAmount(rawBalance, decimals), {
                    maximumFractionDigits: 6,
                  })}
                </span>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )
            }
          </SkeletonSlot>
        </div>
        <div className="flex-1 px-4 py-3">
          <div className="text-muted-foreground text-body-xs mb-2 uppercase">
            {t('overview.value')}
          </div>
          <SkeletonSlot
            fallback={<Skeleton className="h-5 w-32" />}
            loading={loading}
          >
            {() =>
              rawBalance !== null && hasPrice ? (
                <span className="text-body-sm">
                  {currencyFormat(toTokenPrice(rawBalance, decimals, price))}
                  <span className="text-muted-foreground ml-2">
                    @{numberFormat(price, { maximumFractionDigits: 6 })}
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )
            }
          </SkeletonSlot>
        </div>
      </CardContent>
    </Card>
  );
};
