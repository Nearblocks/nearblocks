'use client';

import Big from 'big.js';
import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  MTTokenHolder,
  MTTokenHolderCountRes,
  MTTokenHoldersRes,
  MTTokenRes,
} from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import {
  countFormat,
  currencyFormat,
  isApproxCount,
  numberFormat,
  toTokenAmount,
} from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  holderCountPromise?: Promise<MTTokenHolderCountRes>;
  holdersPromise?: Promise<MTTokenHoldersRes>;
  loading?: boolean;
  tokenPromise?: Promise<MTTokenRes>;
};

type HolderRow = MTTokenHolder & {
  quantity: string;
  value: null | string;
};

export const MtFtHolders = ({
  holderCountPromise,
  holdersPromise,
  loading,
  tokenPromise,
}: Props) => {
  const { t } = useLocale('mts');
  const holders = !loading && holdersPromise ? use(holdersPromise) : null;
  if (holders?.errors?.length) throw new Error('Failed to load holders');
  const holderCount =
    !loading && holderCountPromise ? use(holderCountPromise) : null;
  const tokenRes = !loading && tokenPromise ? use(tokenPromise) : null;
  const token = tokenRes?.data ?? null;

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

  const columns: DataTableColumnDef<HolderRow>[] = [
    {
      cell: (h) => <AccountLink account={h.account} textClassName="max-w-80" />,
      header: t('holders.address'),
      id: 'address',
    },
    {
      cell: (h) => (
        <span className="text-body-sm">{numberFormat(h.quantity)}</span>
      ),
      className: 'w-60',
      header: t('holders.quantity'),
      id: 'quantity',
    },
    {
      cell: (h) => (
        <span className="text-body-sm">
          {h.value ? currencyFormat(h.value) : 'N/A'}
        </span>
      ),
      className: 'w-60',
      header: t('holders.value'),
      id: 'value',
    },
  ];

  const rows: HolderRow[] =
    holders?.data?.map((h) => {
      const quantity =
        token?.decimals != null
          ? toTokenAmount(h.amount, token.decimals)
          : h.amount;
      const value = token?.price
        ? Big(quantity).mul(token.price).toString()
        : null;

      return { ...h, quantity, value };
    }) ?? [];

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={loading ? undefined : rows}
          emptyMessage={t('holders.empty')}
          getRowKey={(h) => h.account}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={!!loading}
            >
              {() => {
                const count = holderCount?.data?.count ?? 0;
                return (
                  <>
                    {t(
                      isApproxCount(count)
                        ? 'holders.total'
                        : 'holders.totalExact',
                      { count: countFormat(count) },
                    )}
                  </>
                );
              }}
            </SkeletonSlot>
          }
          loading={!!loading}
          onPaginationNavigate={onPaginate}
          pagination={holders?.meta}
        />
      </CardContent>
    </Card>
  );
};
