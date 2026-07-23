'use client';

import Big from 'big.js';
import { use } from 'react';

import { BlockCount, BlockListItem, BlocksRes, BlockStats } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { StatCard } from '@/components/stat-card';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import {
  countFormat,
  gasFee,
  gasFormat,
  nearFormat,
  numberFormat,
} from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  blockCountPromise?: Promise<BlockCount | null>;
  blocksPromise?: Promise<BlocksRes>;
  blockStatsPromise?: Promise<BlockStats | null>;
  loading?: boolean;
};

export const Blocks = ({
  blockCountPromise,
  blocksPromise,
  blockStatsPromise,
  loading,
}: Props) => {
  const { t } = useLocale('blocks');
  const blocks = !loading && blocksPromise ? use(blocksPromise) : null;
  if (blocks?.errors?.length) throw new Error('Failed to load blocks');
  const blockCount =
    !loading && blockCountPromise ? use(blockCountPromise) : null;
  const blockStats =
    !loading && blockStatsPromise ? use(blockStatsPromise) : null;

  const utilization =
    blockStats && blockStats.gas_limit !== '0'
      ? Big(blockStats.gas_used)
          .div(Big(blockStats.gas_limit))
          .mul(100)
          .toFixed(2) + '%'
      : '0%';

  const columns: DataTableColumnDef<BlockListItem>[] = [
    {
      cell: (block) => (
        <Link className="text-link" href={`/blocks/${block.block_height}`}>
          {numberFormat(block.block_height)}
        </Link>
      ),
      className: 'w-40',
      csvLabel: 'Block',
      csvValue: (block) => block.block_height,
      header: t('columns.block'),
      id: 'block',
    },
    {
      cell: (block) => (
        <AccountLink
          account={block.author_account_id}
          textClassName="max-w-50"
        />
      ),
      className: 'w-60',
      csvLabel: 'Author',
      csvValue: (block) => block.author_account_id ?? '',
      header: t('columns.author'),
      id: 'author',
    },
    {
      cell: (block) => numberFormat(block.transactions_agg.count),
      className: 'w-30',
      csvLabel: 'Txns',
      csvValue: (block) => block.transactions_agg.count,
      header: t('columns.txns'),
      id: 'txns_count',
    },
    {
      cell: (block) => `${gasFormat(block.chunks_agg.gas_used)} Tgas`,
      csvLabel: 'Gas Used (Tgas)',
      csvValue: (block) => gasFormat(block.chunks_agg.gas_used),
      header: t('columns.gasUsed'),
      id: 'gas_used',
    },
    {
      cell: (block) => `${gasFormat(block.chunks_agg.gas_limit)} Tgas`,
      csvLabel: 'Gas Limit (Tgas)',
      csvValue: (block) => gasFormat(block.chunks_agg.gas_limit),
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
      csvLabel: 'Gas Fee (NEAR)',
      csvValue: (block) => gasFee(block.chunks_agg.gas_used, block.gas_price),
      header: t('columns.gasFee'),
      id: 'gas_fee',
    },
    {
      cell: (block) => <TimestampCell ns={block.block_timestamp} />,
      cellClassName: 'px-1',
      className: 'w-40',
      csvLabel: 'Block Timestamp',
      csvValue: (block) => block.block_timestamp ?? '',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const statItems = [
    {
      href: '/charts/blocks',
      label: t('stats.networkUtilization'),
      value: utilization,
    },
    {
      href: '/charts/blocks',
      label: t('stats.blocks'),
      value: numberFormat(blockStats?.blocks),
    },
    {
      href: '/charts/txn-fee',
      label: t('stats.gasPrice'),
      skeletonIcon: true,
      value: blockStats ? (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {gasFormat(blockStats.gas_price, { maximumSignificantDigits: 4 })} /
          TGas
        </span>
      ) : null,
    },
    {
      href: '/charts/txn-fee',
      label: t('stats.burntFees'),
      skeletonIcon: true,
      value: blockStats ? (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(blockStats.tokens_burnt)}
        </span>
      ) : null,
    },
  ];

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map(({ href, label, skeletonIcon, value }) => (
          <StatCard
            href={href}
            key={label}
            label={label}
            loading={!!loading}
            skeletonIcon={skeletonIcon}
            value={value}
          />
        ))}
      </div>
      <Card>
        <CardContent className="text-body-sm p-0">
          <DataTable
            columns={columns}
            data={blocks?.data}
            downloadFilename="nearblocks-blocks"
            emptyMessage={t('empty')}
            getRowKey={(block) => block.block_hash}
            header={
              <SkeletonSlot
                fallback={<Skeleton className="w-64" />}
                loading={!!loading}
              >
                {() => {
                  const count = blockCount?.count;
                  if (!count || count === '0') return null;
                  return <>{t('total', { count: countFormat(count) })}</>;
                }}
              </SkeletonSlot>
            }
            loading={!!loading}
            onPaginationNavigate={(type, cursor) =>
              type === 'first' ? '/blocks' : `/blocks?${type}=${cursor}`
            }
            pagination={blocks?.meta}
          />
        </CardContent>
      </Card>
    </>
  );
};
