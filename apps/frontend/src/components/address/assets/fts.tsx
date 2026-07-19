'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountAssetFT,
  AccountAssetFTCount,
  AccountAssetFTsRes,
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
import { buildParams } from '@/lib/utils';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  account?: string;
  countPromise?: Promise<AccountAssetFTCount | null>;
  ftsPromise?: Promise<AccountAssetFTsRes>;
  loading?: boolean;
};

export const FTAssets = ({
  account,
  countPromise,
  ftsPromise,
  loading,
}: Props) => {
  const { t } = useLocale('address');
  const fts = !loading && ftsPromise ? use(ftsPromise) : null;
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

  const columns: DataTableColumnDef<AccountAssetFT>[] = [
    {
      cell: (ft) => (
        <span className="flex items-center gap-2">
          <TokenImage
            alt={ft.meta?.name ?? ''}
            className="m-px size-5 rounded-full border"
            src={ft.meta?.icon ?? ''}
          />
          <Link
            className="text-link"
            href={`/tokens/${ft.contract}${
              account ? `?account=${account}` : ''
            }`}
          >
            {ft.meta?.name ?? ft.contract}
            {ft.meta?.symbol ? ` (${ft.meta.symbol})` : ''}
          </Link>
        </span>
      ),
      cellClassName: 'px-4',
      className: 'w-60',
      header: t('assets.fts.token'),
      id: 'token',
      skeletonCell: (
        <span className="flex items-center gap-2">
          <Skeleton className="size-5 shrink-0 rounded-full" />
          <Skeleton className="w-24" />
        </span>
      ),
    },
    {
      cell: (ft) =>
        numberFormat(toTokenAmount(ft.amount, ft.meta?.decimals ?? 0), {
          maximumFractionDigits: 6,
        }),
      header: t('assets.fts.amount'),
      id: 'amount',
    },
    {
      cell: (ft) =>
        ft.meta?.price ? currencyFormat(ft.meta.price) : <span>N/A</span>,
      header: t('assets.fts.price'),
      id: 'price',
    },
    {
      cell: (ft) =>
        ft.meta?.price && ft.meta?.decimals != null ? (
          currencyFormat(
            toTokenPrice(ft.amount, ft.meta.decimals, ft.meta.price),
          )
        ) : (
          <span>$0</span>
        ),
      header: t('assets.fts.value'),
      id: 'value',
    },
  ];

  return (
    <div className="-mx-3 -mb-3 border-t">
      <DataTable
        columns={columns}
        data={fts?.data}
        emptyMessage={t('assets.fts.empty')}
        getRowKey={(ft) => ft.contract}
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
                      ? 'assets.fts.total'
                      : 'assets.fts.totalExact',
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
        pagination={fts?.meta}
        skeletonRows={10}
      />
    </div>
  );
};
