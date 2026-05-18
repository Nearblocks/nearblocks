'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { TxnCount, TxnListItem, TxnsRes, TxnStats } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { StatCard } from '@/components/stat-card';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirectionIcon, TxnStatusIcon } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import {
  countFormat,
  isApproxCount,
  nearFormat,
  numberFormat,
} from '@/lib/format';
import { actionMethod } from '@/lib/txn';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  showStats?: boolean;
  txnCountPromise?: Promise<null | TxnCount>;
  txnsPromise?: Promise<TxnsRes>;
  txnStatsPromise?: Promise<null | TxnStats>;
};

export const Txns = ({
  loading,
  showStats,
  txnCountPromise,
  txnsPromise,
  txnStatsPromise,
}: Props) => {
  const { t } = useLocale('txns');
  const router = useRouter();
  const searchParams = useSearchParams();
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;
  const txnStats = !loading && txnStatsPromise ? use(txnStatsPromise) : null;

  const columns: DataTableColumnDef<TxnListItem>[] = [
    {
      cell: (txn) => <TxnStatusIcon status={txn.outcomes?.status} />,
      className: 'w-5',
      header: '',
      id: 'status',
      skeletonCell: <Skeleton className="size-4 rounded-full" />,
    },
    {
      cell: (txn) => (
        <Link className="text-link" href={`/txns/${txn.transaction_hash}`}>
          <Truncate>
            <TruncateText text={txn.transaction_hash} />
            <TruncateCopy text={txn.transaction_hash} />
          </Truncate>
        </Link>
      ),
      csvLabel: 'Transaction Hash',
      csvValue: (txn) => txn.transaction_hash,
      header: t('list.txnHash'),
      id: 'txn_hash',
      skeletonWidth: 'w-36',
    },
    {
      cell: (txn) => (
        <Badge className="text-body-xs px-1.5 py-0" variant="teal">
          <Truncate>
            <TruncateText
              className="max-w-20"
              text={actionMethod(txn.actions)}
            />
          </Truncate>
        </Badge>
      ),
      csvLabel: 'Method',
      csvValue: (txn) => actionMethod(txn.actions),
      header: t('list.method'),
      id: 'method',
      skeletonCell: <Skeleton className="h-4.5 w-16 rounded-md" />,
    },
    {
      cell: (txn) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txn.actions_agg?.deposit)}
        </span>
      ),
      csvLabel: 'Deposit Value (NEAR)',
      csvValue: (txn) => nearFormat(txn.actions_agg?.deposit),
      header: t('list.deposit'),
      id: 'deposit',
      skeletonCell: (
        <span className="flex items-center gap-1">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="w-16" />
        </span>
      ),
    },
    {
      cell: (txn) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txn.outcomes_agg?.transaction_fee)}
        </span>
      ),
      csvLabel: 'Txn Fee (NEAR)',
      csvValue: (txn) => nearFormat(txn.outcomes_agg?.transaction_fee),
      header: t('list.fee'),
      id: 'txn_fee',
      skeletonCell: (
        <span className="flex items-center gap-1">
          <Skeleton className="size-4 rounded-full" />
          <Skeleton className="w-16" />
        </span>
      ),
    },
    {
      cell: (txn) => <AccountLink account={txn.signer_account_id} />,
      csvLabel: 'From',
      csvValue: (txn) => txn.signer_account_id ?? '',
      header: t('list.from'),
      id: 'from',
      skeletonWidth: 'w-32',
    },
    {
      cell: () => <TxnDirectionIcon />,
      className: 'w-12',
      header: '',
      id: 'direction',
      skeletonCell: <Skeleton className="size-5 rounded-md" />,
    },
    {
      cell: (txn) => <AccountLink account={txn.receiver_account_id} />,
      csvLabel: 'To',
      csvValue: (txn) => txn.receiver_account_id ?? '',
      header: t('list.to'),
      id: 'to',
      skeletonWidth: 'w-32',
    },
    {
      cell: (txn) => (
        <Link className="text-link" href={`/blocks/${txn.block?.block_hash}`}>
          {numberFormat(txn.block?.block_height)}
        </Link>
      ),
      csvLabel: 'Block',
      csvValue: (txn) => txn.block?.block_height ?? '',
      enableFilter: true,
      filterName: 'block',
      filterPlaceholder: t('list.filterBlock'),
      header: t('list.block'),
      id: 'block',
      skeletonWidth: 'w-20',
    },
    {
      cell: (txn) => <TimestampCell ns={txn.block?.block_timestamp} />,
      cellClassName: 'px-1',
      className: 'w-40',
      csvLabel: 'Block Timestamp',
      csvValue: (txn) => txn.block?.block_timestamp ?? '',
      header: <TimestampToggle />,
      id: 'age',
      skeletonWidth: 'w-24',
    },
  ];

  const onFilter = (value: FilterData) => {
    const params = buildParams(searchParams, value);
    router.push(`/txns?${params.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const params = buildParams(searchParams, data);
    router.push(`/txns?${params.toString()}`);
  };

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const params =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `/txns?${params.toString()}`;
  };

  const statItems = [
    {
      href: '/charts/txns',
      label: t('stats.txns'),
      skeletonWidth: 'w-24',
      value: numberFormat(txnStats?.txns),
    },
    {
      href: '/charts/txns',
      label: t('stats.peakTps'),
      skeletonWidth: 'w-12',
      value: txnStats
        ? numberFormat(txnStats.peak_tps, { maximumFractionDigits: 2 })
        : null,
    },
    {
      href: '/charts/txn-fee',
      label: t('stats.gasFee'),
      skeletonIcon: true,
      skeletonWidth: 'w-20',
      value: txnStats ? (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txnStats.tokens_burnt)}
        </span>
      ) : null,
    },
    {
      href: '/charts/txn-fee',
      label: t('stats.avgGasFee'),
      skeletonIcon: true,
      skeletonWidth: 'w-24',
      value: txnStats ? (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txnStats.avg_gas_fee)}
        </span>
      ) : null,
    },
  ];

  return (
    <>
      {showStats && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statItems.map(
            ({ href, label, skeletonIcon, skeletonWidth, value }) => (
              <StatCard
                href={href}
                key={label}
                label={label}
                loading={loading || !txnStats}
                skeletonIcon={skeletonIcon}
                skeletonWidth={skeletonWidth}
                value={value}
              />
            ),
          )}
        </div>
      )}
      <Card>
        <CardContent className="text-body-sm p-0">
          <DataTable
            columns={columns}
            data={txns?.data}
            downloadFilename="nearblocks-txns"
            emptyMessage={t('list.empty')}
            getRowKey={(txn) => txn.transaction_hash}
            header={
              <SkeletonSlot
                fallback={<Skeleton className="w-40" />}
                loading={loading || !txnCount}
              >
                {() => {
                  const count = txnCount?.count;
                  if (!count || count === '0') return null;
                  return t(
                    isApproxCount(count) ? 'list.total' : 'list.totalExact',
                    { count: countFormat(count) },
                  );
                }}
              </SkeletonSlot>
            }
            loading={loading || !!txns?.errors}
            onClear={onClear}
            onFilter={onFilter}
            onPaginationNavigate={onPaginate}
            pagination={txns?.meta}
          />
        </CardContent>
      </Card>
    </>
  );
};
