'use client';

import { use } from 'react';

import { BlockCount, BlockListItem, BlocksRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { NearCircle } from '@/icons/near-circle';
import { gasFee, gasFormat, numberFormat } from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  blockCountPromise?: Promise<BlockCount | null>;
  blocksPromise?: Promise<BlocksRes>;
  loading?: boolean;
};

export const Blocks = ({
  blockCountPromise,
  blocksPromise,
  loading,
}: Props) => {
  const blocks = !loading && blocksPromise ? use(blocksPromise) : null;
  const blockCount =
    !loading && blockCountPromise ? use(blockCountPromise) : null;

  const columns: DataTableColumnDef<BlockListItem>[] = [
    {
      cell: (block) => (
        <Link className="text-link" href={`/blocks/${block.block_height}`}>
          {numberFormat(block.block_height)}
        </Link>
      ),
      header: 'Block',
      id: 'block',
    },
    {
      cell: (block) => <AccountLink account={block.author_account_id} />,
      header: 'Author',
      id: 'author',
    },
    {
      cell: (block) => numberFormat(block.transactions_agg.count),
      header: 'Txns',
      id: 'txns_count',
    },
    {
      cell: (block) => `${gasFormat(block.chunks_agg.gas_used)} Tgas`,
      header: 'Gas Used',
      id: 'gas_used',
    },
    {
      cell: (block) => `${gasFormat(block.chunks_agg.gas_limit)} Tgas`,
      header: 'Gas Limit',
      id: 'gas_limit',
    },
    {
      cell: (block) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {gasFee(block.chunks_agg.gas_used, block.gas_price)}
        </span>
      ),
      header: 'Gas Fee',
      id: 'gas_fee',
    },
    {
      cell: (block) => <TimestampCell ns={block.block_timestamp} />,
      className: 'w-42',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={blocks?.data}
          emptyMessage="No blocks found"
          getRowKey={(block) => block.block_hash}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !blockCount}
            >
              {() => (
                <>{`A total of ${numberFormat(
                  blockCount?.count ?? 0,
                )} blocks found`}</>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!blocks?.errors}
          onPaginationNavigate={(type, cursor) => `/blocks?${type}=${cursor}`}
          pagination={blocks?.meta}
        />
      </CardContent>
    </Card>
  );
};
