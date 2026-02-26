'use client';

import Big from 'big.js';
import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  NFTContractHolderCountRes,
  NFTContractHolders,
  NFTContractHoldersRes,
  NFTContractRes,
} from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  contractPromise?: Promise<NFTContractRes>;
  holderCountPromise?: Promise<NFTContractHolderCountRes>;
  holdersPromise?: Promise<NFTContractHoldersRes>;
  loading?: boolean;
};

type HolderRow = NFTContractHolders & {
  percentage: null | string;
};

const columns: DataTableColumnDef<HolderRow>[] = [
  {
    cell: (holder) => (
      <AccountLink account={holder.account} textClassName="max-w-80" />
    ),
    header: 'Address',
    id: 'address',
  },
  {
    cell: (holder) => numberFormat(holder.quantity),
    className: 'w-60',
    header: 'Quantity',
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
    header: 'Percentage',
    id: 'percentage',
  },
];

export const NftTokenHolders = ({
  contractPromise,
  holderCountPromise,
  holdersPromise,
  loading,
}: Props) => {
  const holders = !loading && holdersPromise ? use(holdersPromise) : null;
  const holderCount =
    !loading && holderCountPromise ? use(holderCountPromise) : null;
  const contractRes = !loading && contractPromise ? use(contractPromise) : null;
  const contract = contractRes?.data ?? null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `${pathname}?${params.toString()}`;
  };

  const rows: HolderRow[] =
    holders?.data?.map((h) => ({
      ...h,
      percentage:
        !contract?.tokens || +contract.tokens <= 0
          ? null
          : Big(h.quantity).div(contract.tokens).mul(100).toString(),
    })) ?? [];

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={loading ? undefined : rows}
          emptyMessage="No token holders found"
          getRowKey={(h) => h.account}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !holderCount}
            >
              {() => (
                <>{`A total of ${numberFormat(
                  holderCount?.data?.count ?? 0,
                )} token holders found`}</>
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
