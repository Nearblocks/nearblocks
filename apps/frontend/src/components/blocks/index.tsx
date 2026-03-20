'use client';

import { use } from 'react';

import { BlockCount, BlockListItem, BlocksRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { useLocale } from '@/hooks/use-locale';
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
  const { t } = useLocale('blocks');
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
      header: t('columns.block'),
      id: 'block',
    },
    {
      cell: (block) => <AccountLink account={block.author_account_id} />,
      header: t('columns.author'),
      id: 'author',
    },
    {
      cell: (block) => numberFormat(block.transactions_agg.count),
      header: t('columns.txns'),
      id: 'txns_count',
    },
    {
      cell: (block) => `${gasFormat(block.chunks_agg.gas_used)} Tgas`,
      header: t('columns.gasUsed'),
      id: 'gas_used',
    },
    {
      cell: (block) => `${gasFormat(block.chunks_agg.gas_limit)} Tgas`,
      header: t('columns.gasLimit'),
      id: 'gas_limit',
    },
    {
      cell: (block) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {gasFee(block.chunks_agg.gas_used, block.gas_price)}
        </span>
      ),
      header: t('columns.gasFee'),
      id: 'gas_fee',
    },
    {
      cell: (block) => <TimestampCell ns={block.block_timestamp} />,
      cellClassName: 'px-1',
      className: 'w-40',
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
          emptyMessage={t('empty')}
          getRowKey={(block) => block.block_hash}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !blockCount}
            >
              {() => (
                <>
                  {t('total', {
                    count: numberFormat(blockCount?.count ?? 0),
                  })}
                </>
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
