'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { NFTTokenTxn, NFTTokenTxnCountRes, NFTTokenTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { Link } from '@/components/link';
import { AccountLink } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnStatusIcon } from '@/components/txn';
import { TxnDirectionIcon } from '@/components/txn';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  txnCountPromise?: Promise<NFTTokenTxnCountRes>;
  txnsPromise?: Promise<NFTTokenTxnsRes>;
};

const txnColumns: DataTableColumnDef<NFTTokenTxn>[] = [
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
    header: 'Txn Hash',
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
    header: 'Method',
    id: 'method',
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
    cell: (nft) =>
      nft.block?.block_height ? (
        <Link className="text-link" href={`/blocks/${nft.block.block_height}`}>
          {numberFormat(nft.block.block_height)}
        </Link>
      ) : (
        <Skeleton className="w-20" />
      ),
    header: 'Block',
    id: 'block',
  },
  {
    cell: (nft) =>
      nft.block?.block_timestamp ? (
        <TimestampCell ns={nft.block.block_timestamp} />
      ) : (
        <Skeleton className="w-20" />
      ),
    cellClassName: 'px-1',
    className: 'w-40',
    header: <TimestampToggle />,
    id: 'age',
  },
];

export const NftTransfers = ({
  loading,
  txnCountPromise,
  txnsPromise,
}: Props) => {
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;

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
    <Card className="mt-10">
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={txnColumns}
          data={txns?.data}
          emptyMessage="No NFT token transfers found"
          getRowKey={(nft) => `${nft.receipt_id}-${nft.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !txnCount}
            >
              {() => (
                <>{`A total of ${numberFormat(
                  txnCount?.data?.count ?? 0,
                )} transactions found`}</>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!txns?.errors}
          onPaginationNavigate={onPaginate}
          pagination={txns?.meta}
        />
      </CardContent>
    </Card>
  );
};
