'use client';

import { useSearchParams } from 'next/navigation';
import { use } from 'react';

import { FTCountRes, FTList, FTListRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { PriceChange } from '@/components/price-change';
import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage, TokenLink } from '@/components/token';
import { currencyFormat, numberFormat, toTokenAmount } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  tokenCountPromise?: Promise<FTCountRes>;
  tokensPromise?: Promise<FTListRes>;
};

const columns: DataTableColumnDef<FTList>[] = [
  {
    cell: (token) => (
      <span className="flex items-center gap-2">
        <TokenImage
          alt={token.name}
          className="m-px size-5 rounded-full border"
          src={token.icon ?? ''}
        />
        <TokenLink
          contract={token.contract}
          name={token.name}
          symbol={token.symbol}
        />
      </span>
    ),
    cellClassName: 'px-4',
    className: 'w-60',
    enableSort: true,
    header: 'TOKEN',
    id: 'token',
    sortName: 'name',
  },
  {
    cell: (token) =>
      token.price ? currencyFormat(token.price) : <span>N/A</span>,
    enableSort: true,
    header: 'Price',
    id: 'price',
    sortName: 'price',
  },
  {
    cell: (token) =>
      token.change_24h ? (
        <PriceChange change={token.change_24h} />
      ) : (
        <span>N/A</span>
      ),
    header: 'Change (%)',
    id: 'change',
  },
  {
    cell: (token) =>
      token.volume_24h ? currencyFormat(token.volume_24h) : <span>$0</span>,
    header: 'Volume (24H)',
    id: 'volume',
  },
  {
    cell: (token) =>
      token.market_cap && parseFloat(token.market_cap) > 0 ? (
        currencyFormat(token.market_cap)
      ) : (
        <span>N/A</span>
      ),
    enableSort: true,
    header: 'Circulating MC',
    id: 'market_cap',
    sortName: 'market_cap',
  },
  {
    cell: (token) =>
      token.onchain_market_cap && parseFloat(token.onchain_market_cap) > 0 ? (
        currencyFormat(token.onchain_market_cap)
      ) : (
        <span>N/A</span>
      ),
    enableSort: true,
    header: 'On-Chain MC',
    id: 'onchain_mc',
    sortName: 'onchain_market_cap',
  },
  {
    cell: (token) => numberFormat(token.holders),
    enableSort: true,
    header: 'Holders',
    id: 'holders',
    sortName: 'holders',
  },
  {
    cell: (token) => {
      if (!token.total_supply || token.decimals == null)
        return <span>N/A</span>;
      return (
        <span>
          {numberFormat(toTokenAmount(token.total_supply, token.decimals), {
            maximumFractionDigits: 0,
          })}
        </span>
      );
    },
    header: 'Total Supply',
    id: 'total_supply',
  },
];

export const Tokens = ({
  loading,
  tokenCountPromise,
  tokensPromise,
}: Props) => {
  const searchParams = useSearchParams();
  const tokens = !loading && tokensPromise ? use(tokensPromise) : null;
  const tokenCount =
    !loading && tokenCountPromise ? use(tokenCountPromise) : null;

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `/tokens?${params.toString()}`;
  };

  const onSort = (sort: string, order: 'asc' | 'desc') => {
    const params = buildParams(searchParams, {
      next: '',
      order,
      prev: '',
      sort,
    });
    return `/tokens?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={tokens?.data}
          defaultSort="onchain_market_cap"
          emptyMessage="No tokens found"
          getRowKey={(token) => token.contract}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !tokenCount}
            >
              {() => (
                <>{`A total of ${numberFormat(
                  tokenCount?.data?.count ?? 0,
                )} Token Contracts found`}</>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!tokens?.errors}
          onPaginationNavigate={onPaginate}
          onSortNavigate={onSort}
          pagination={tokens?.meta}
        />
      </CardContent>
    </Card>
  );
};
