'use client';

import Big from 'big.js';
import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  FTContractHolderCountRes,
  FTContractHolders,
  FTContractHoldersRes,
  FTContractRes,
} from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { currencyFormat, numberFormat, toTokenAmount } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  contractPromise?: Promise<FTContractRes>;
  holderCountPromise?: Promise<FTContractHolderCountRes>;
  holdersPromise?: Promise<FTContractHoldersRes>;
  loading?: boolean;
};

type HolderRow = FTContractHolders & {
  percentage: null | string;
  quantity: string;
  value: null | string;
};

export const TokenHolders = ({
  contractPromise,
  holderCountPromise,
  holdersPromise,
  loading,
}: Props) => {
  const { t } = useLocale('fts');
  const holders = !loading && holdersPromise ? use(holdersPromise) : null;
  const holderCount =
    !loading && holderCountPromise ? use(holderCountPromise) : null;
  const contractRes = !loading && contractPromise ? use(contractPromise) : null;
  const contract = contractRes?.data ?? null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const columns: DataTableColumnDef<HolderRow>[] = [
    {
      cell: (holder) => (
        <AccountLink account={holder.account} textClassName="max-w-80" />
      ),
      header: t('holders.address'),
      id: 'address',
    },
    {
      cell: (holder) => numberFormat(holder.quantity),
      className: 'w-60',
      header: t('holders.quantity'),
      id: 'quantity',
    },
    {
      cell: (holder) =>
        holder.percentage ? (
          <div className="min-w-32">
            <span>
              {numberFormat(holder.percentage, { maximumFractionDigits: 4 })}%
            </span>
            <div className="bg-border mt-1 h-0.5 w-full rounded-full">
              <div
                className="h-0.5 rounded-full bg-teal-500"
                style={{
                  width: `${Math.min(parseFloat(holder.percentage), 100)}%`,
                }}
              />
            </div>
          </div>
        ) : (
          'N/A'
        ),
      className: 'w-60',
      header: t('holders.percentage'),
      id: 'percentage',
    },
    {
      cell: (holder) => (holder.value ? currencyFormat(holder.value) : 'N/A'),
      className: 'w-60',
      header: t('holders.value'),
      id: 'value',
    },
  ];

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `${pathname}?${params.toString()}`;
  };

  const rows: HolderRow[] =
    holders?.data?.map((h) => {
      const quantity = contract?.decimals
        ? toTokenAmount(h.amount, contract?.decimals)
        : h.amount;
      const percentage =
        !contract?.total_supply || +contract.total_supply <= 0
          ? null
          : Big(quantity).div(contract.total_supply).mul(100).toString();
      const value = contract?.price
        ? Big(quantity).mul(contract.price).toString()
        : null;

      return {
        ...h,
        percentage,
        quantity,
        value,
      };
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
              loading={loading || !holderCount}
            >
              {() => (
                <>
                  {t('holders.total', {
                    count: numberFormat(holderCount?.data?.count ?? 0),
                  })}
                </>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!holders?.errors}
          onPaginationNavigate={onPaginate}
          pagination={holders?.meta}
        />
      </CardContent>
    </Card>
  );
};
