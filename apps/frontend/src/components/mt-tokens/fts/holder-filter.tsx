'use client';

import { RiCloseLine } from '@remixicon/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, use } from 'react';
import useSWR from 'swr';

import { AccountAssetMTFT, MTTokenRes } from 'nb-schemas';

import { getMTTokenHolderBalance } from '@/actions/mt-token';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
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
  tid: string;
  tokenPromise: Promise<MTTokenRes>;
};

type CellProps = {
  balanceData: AccountAssetMTFT | null | undefined;
  loading: boolean;
  tokenPromise: Promise<MTTokenRes>;
};

// The token-dependent cells suspend on the token promise behind their own
// Suspense boundaries so the card shell renders synchronously — the card's
// presence is determined by the `account` search param alone.
const BalanceCell = ({ balanceData, loading, tokenPromise }: CellProps) => {
  const result = use(tokenPromise);
  const token = result?.data ?? null;
  const balance = balanceData?.amount ?? null;
  const decimals = balanceData?.meta?.decimals ?? token?.decimals ?? 0;

  return (
    <SkeletonSlot fallback={<Skeleton className="w-32" />} loading={loading}>
      {() =>
        balance !== null ? (
          <span className="text-body-sm">
            {numberFormat(toTokenAmount(balance, decimals), {
              maximumFractionDigits: 6,
            })}
          </span>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      }
    </SkeletonSlot>
  );
};

const ValueCell = ({ balanceData, loading, tokenPromise }: CellProps) => {
  const result = use(tokenPromise);
  const token = result?.data ?? null;
  const balance = balanceData?.amount ?? null;
  const decimals = balanceData?.meta?.decimals ?? token?.decimals ?? 0;
  const price = balanceData?.token_meta?.price ?? token?.price ?? '0';
  const hasPrice = parseFloat(price) > 0;

  return (
    <SkeletonSlot fallback={<Skeleton className="w-32" />} loading={loading}>
      {() =>
        balance !== null && hasPrice ? (
          <span className="text-body-sm">
            {currencyFormat(toTokenPrice(balance, decimals, price))}
            <span className="text-muted-foreground ml-2">
              @{numberFormat(price, { maximumFractionDigits: 6 })}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      }
    </SkeletonSlot>
  );
};

export const MtFtHolderFilter = ({ cid, tid, tokenPromise }: Props) => {
  const { t } = useLocale('mts');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const account = searchParams.get('account');

  const { data: balanceData, isLoading } = useSWR(
    account ? ['mt-holder-balance', cid, tid, account] : null,
    () => getMTTokenHolderBalance(cid, tid, account as string),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  if (!account) return null;

  const balance = balanceData?.amount ?? null;
  const loading = balance === null && isLoading;

  const params = new URLSearchParams(searchParams.toString());
  params.delete('account');
  const closeHref =
    params.size > 0 ? `${pathname}?${params.toString()}` : pathname;

  return (
    <Card className="mb-4">
      <CardContent className="flex flex-col divide-y px-0 md:flex-row md:divide-x md:divide-y-0">
        <div className="flex-1 px-4 py-3">
          <div className="text-muted-foreground text-body-xs mb-2 uppercase">
            {t('token.holderFilter.filteredBy')}
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
            {t('token.holderFilter.balance')}
          </div>
          <Suspense fallback={<Skeleton className="w-32" />}>
            <BalanceCell
              balanceData={balanceData}
              loading={loading}
              tokenPromise={tokenPromise}
            />
          </Suspense>
        </div>
        <div className="flex-1 px-4 py-3">
          <div className="text-muted-foreground text-body-xs mb-2 uppercase">
            {t('token.holderFilter.value')}
          </div>
          <Suspense fallback={<Skeleton className="w-32" />}>
            <ValueCell
              balanceData={balanceData}
              loading={loading}
              tokenPromise={tokenPromise}
            />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
};
