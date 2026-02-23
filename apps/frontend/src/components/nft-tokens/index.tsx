'use client';

import { useSearchParams } from 'next/navigation';
import { use } from 'react';

import { NFTCountRes, NFTList, NFTListRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage, TokenLink } from '@/components/token';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  nftTokenCountPromise?: Promise<NFTCountRes>;
  nftTokensPromise?: Promise<NFTListRes>;
};

const columns: DataTableColumnDef<NFTList>[] = [
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
          type="nft-tokens"
        />
      </span>
    ),
    cellClassName: 'px-4',
    enableSort: true,
    header: 'TOKEN',
    id: 'token',
    sortName: 'name',
  },
  {
    cell: (token) => numberFormat(token.tokens),
    className: 'w-40',
    enableSort: true,
    header: 'Tokens',
    id: 'tokens',
    sortName: 'tokens',
  },
  {
    cell: (token) => numberFormat(token.transfers_24h),
    className: 'w-40',
    enableSort: true,
    header: 'Transfers (24H)',
    id: 'transfers_24h',
    sortName: 'transfers_24h',
  },
  {
    cell: (token) => numberFormat(token.holders),
    className: 'w-40',
    enableSort: true,
    header: 'Holders',
    id: 'holders',
    sortName: 'holders',
  },
];

export const NftTokens = ({
  loading,
  nftTokenCountPromise,
  nftTokensPromise,
}: Props) => {
  const searchParams = useSearchParams();
  const tokens = !loading && nftTokensPromise ? use(nftTokensPromise) : null;
  const tokenCount =
    !loading && nftTokenCountPromise ? use(nftTokenCountPromise) : null;

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `/nft-tokens?${params.toString()}`;
  };

  const onSort = (sort: string, order: 'asc' | 'desc') => {
    const params = buildParams(searchParams, {
      next: '',
      order,
      prev: '',
      sort,
    });
    return `/nft-tokens?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={tokens?.data}
          defaultSort="transfers_24h"
          emptyMessage="No NFT tokens found"
          getRowKey={(token) => token.contract}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !tokenCount}
            >
              {() => (
                <>{`A total of ${numberFormat(
                  tokenCount?.data?.count ?? 0,
                )} NFT Token Contracts found`}</>
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
