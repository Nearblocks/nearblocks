'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { NFTContractTxnCountRes, NFTContractTxnsRes, NFTTxn } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirectionIcon, TxnStatusIcon } from '@/components/txn';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  nftCountPromise?: Promise<NFTContractTxnCountRes>;
  nftsPromise?: Promise<NFTContractTxnsRes>;
};

const columns: DataTableColumnDef<NFTTxn>[] = [
  {
    cell: () => <TxnStatusIcon status />,
    className: 'w-5',
    header: '',
    id: 'status',
  },
  {
    cell: (nft) =>
      nft.transaction_hash ? (
        <Link className="text-link" href={`/txns/${nft.transaction_hash}`}>
          <Truncate>
            <TruncateText text={nft.transaction_hash} />
            <TruncateCopy text={nft.transaction_hash} />
          </Truncate>
        </Link>
      ) : (
        <Skeleton className="w-30" />
      ),
    header: 'Hash',
    id: 'txn_hash',
  },
  {
    cell: (nft) => (
      <Badge variant="teal">
        <Truncate>
          <TruncateText className="max-w-20" text={nft.cause} />
        </Truncate>
      </Badge>
    ),
    header: 'Type',
    id: 'type',
  },
  {
    cell: (nft) => (
      <AccountLink
        account={
          nft.cause === 'BURN'
            ? nft.affected_account_id
            : nft.involved_account_id
        }
      />
    ),
    header: 'From',
    id: 'from',
  },
  {
    cell: () => <TxnDirectionIcon />,
    className: 'w-12',
    header: '',
    id: 'direction',
  },
  {
    cell: (nft) => (
      <AccountLink
        account={nft.cause === 'BURN' ? null : nft.affected_account_id}
      />
    ),
    header: 'To',
    id: 'to',
  },
  {
    cell: (nft) => (
      <Link
        className="text-link"
        href={`/nft-token/${nft.contract_account_id}/${nft.token_id}`}
      >
        <Truncate>
          <TruncateText text={nft.token_id} />
          <TruncateCopy text={nft.token_id} />
        </Truncate>
      </Link>
    ),
    header: 'Token ID',
    id: 'token_id',
  },
  {
    cell: (nft) => <TimestampCell ns={nft.block_timestamp} />,
    cellClassName: 'px-1',
    className: 'w-40',
    header: <TimestampToggle />,
    id: 'age',
  },
];

export const NftTokenTransfers = ({
  loading,
  nftCountPromise,
  nftsPromise,
}: Props) => {
  const nfts = !loading && nftsPromise ? use(nftsPromise) : null;
  const nftCount = !loading && nftCountPromise ? use(nftCountPromise) : null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={nfts?.data}
          emptyMessage="No NFT token transfers found"
          getRowKey={(nft) => `${nft.receipt_id}-${nft.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !nftCount}
            >
              {() => (
                <>{`A total of ${numberFormat(
                  nftCount?.data?.count ?? 0,
                )} nft token txns found`}</>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!nfts?.errors}
          onPaginationNavigate={onPaginate}
          pagination={nfts?.meta}
        />
      </CardContent>
    </Card>
  );
};
