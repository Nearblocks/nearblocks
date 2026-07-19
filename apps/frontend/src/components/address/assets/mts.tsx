'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountAssetMTFT,
  AccountAssetMTFTCount,
  AccountAssetMTFTsRes,
} from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage } from '@/components/token';
import { useLocale } from '@/hooks/use-locale';
import {
  countFormat,
  currencyFormat,
  isApproxCount,
  numberFormat,
  toTokenAmount,
  toTokenPrice,
} from '@/lib/format';
import { buildParams, encodeToken } from '@/lib/utils';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  account?: string;
  countPromise?: Promise<AccountAssetMTFTCount | null>;
  loading?: boolean;
  mtsPromise?: Promise<AccountAssetMTFTsRes>;
};

export const MTAssets = ({
  account,
  countPromise,
  loading,
  mtsPromise,
}: Props) => {
  const { t } = useLocale('address');
  const mts = !loading && mtsPromise ? use(mtsPromise) : null;
  const count = !loading && countPromise ? use(countPromise) : null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const params =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `${pathname}?${params.toString()}`;
  };

  const columns: DataTableColumnDef<AccountAssetMTFT>[] = [
    {
      cell: (mt) => (
        <span className="flex items-center gap-2">
          <TokenImage
            alt={mt.meta?.name ?? ''}
            className="m-px size-5 rounded-full border"
            src={mt.meta?.icon ?? ''}
          />
          <Link
            className="text-link"
            href={`/mt-tokens/${mt.contract}/tokens/ft/${encodeToken(
              mt.token,
            )}${account ? `?account=${account}` : ''}`}
          >
            {mt.meta?.name ?? mt.contract}
            {mt.meta?.symbol ? ` (${mt.meta.symbol})` : ''}
          </Link>
        </span>
      ),
      cellClassName: 'px-4',
      className: 'w-60',
      header: t('assets.mts.token'),
      id: 'token',
      skeletonCell: (
        <span className="flex items-center gap-2">
          <Skeleton className="size-5 shrink-0 rounded-full" />
          <Skeleton className="w-24" />
        </span>
      ),
    },
    {
      cell: (mt) =>
        numberFormat(toTokenAmount(mt.amount, mt.meta?.decimals ?? 0), {
          maximumFractionDigits: 6,
        }),
      header: t('assets.mts.amount'),
      id: 'amount',
    },
    {
      cell: (mt) =>
        mt.token_meta?.price ? (
          currencyFormat(mt.token_meta.price)
        ) : (
          <span>N/A</span>
        ),
      header: t('assets.mts.price'),
      id: 'price',
    },
    {
      cell: (mt) =>
        mt.token_meta?.price && mt.meta?.decimals != null ? (
          currencyFormat(
            toTokenPrice(mt.amount, mt.meta.decimals, mt.token_meta.price),
          )
        ) : (
          <span>$0</span>
        ),
      header: t('assets.mts.value'),
      id: 'value',
    },
  ];

  return (
    <div className="-mx-3 -mb-3 border-t">
      <DataTable
        columns={columns}
        data={mts?.data}
        emptyMessage={t('assets.mts.empty')}
        getRowKey={(mt) => `${mt.contract}:${mt.token}`}
        header={
          <SkeletonSlot
            fallback={<Skeleton className="w-40" />}
            loading={!!loading}
          >
            {() => {
              const value = count?.count ?? '0';
              return (
                <>
                  {t(
                    isApproxCount(value)
                      ? 'assets.mts.total'
                      : 'assets.mts.totalExact',
                    { count: countFormat(value) },
                  )}
                </>
              );
            }}
          </SkeletonSlot>
        }
        loading={!!loading}
        onPaginationNavigate={onPaginate}
        paginated={false}
        pagination={mts?.meta}
        skeletonRows={10}
      />
    </div>
  );
};
