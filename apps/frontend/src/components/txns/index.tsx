'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { TxnCount, TxnListItem, TxnsRes, TxnStats } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirectionIcon, TxnStatusIcon } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { actionMethod } from '@/lib/txn';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  txnCountPromise?: Promise<null | TxnCount>;
  txnsPromise?: Promise<TxnsRes>;
  txnStatsPromise?: Promise<null | TxnStats>;
};

export const Txns = ({
  loading,
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
      header: t('list.txnHash'),
      id: 'txn_hash',
    },
    {
      cell: (txn) => (
        <Badge variant="teal">
          <Truncate>
            <TruncateText
              className="max-w-20"
              text={actionMethod(txn.actions)}
            />
          </Truncate>
        </Badge>
      ),
      header: t('list.method'),
      id: 'method',
    },
    {
      cell: (txn) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txn.actions_agg?.deposit)}
        </span>
      ),
      header: t('list.deposit'),
      id: 'deposit',
    },
    {
      cell: (txn) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txn.outcomes_agg?.transaction_fee)}
        </span>
      ),
      header: t('list.fee'),
      id: 'txn_fee',
    },
    {
      cell: (txn) => <AccountLink account={txn.signer_account_id} />,
      header: t('list.from'),
      id: 'from',
    },
    {
      cell: () => <TxnDirectionIcon />,
      className: 'w-12',
      header: '',
      id: 'direction',
    },
    {
      cell: (txn) => <AccountLink account={txn.receiver_account_id} />,
      header: t('list.to'),
      id: 'to',
    },
    {
      cell: (txn) => (
        <Link className="text-link" href={`/blocks/${txn.block?.block_hash}`}>
          {numberFormat(txn.block?.block_height)}
        </Link>
      ),
      enableFilter: true,
      filterName: 'block',
      filterPlaceholder: t('list.filterBlock'),
      header: t('list.block'),
      id: 'block',
    },
    {
      cell: (txn) => <TimestampCell ns={txn.block?.block_timestamp} />,
      cellClassName: 'px-1',
      className: 'w-40',
      header: <TimestampToggle />,
      id: 'age',
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

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `/txns?${params.toString()}`;
  };

  const statItems = [
    {
      label: t('stats.txns'),
      value: numberFormat(txnStats?.txns),
    },
    {
      label: t('stats.peakTps'),
      value: txnStats
        ? numberFormat(txnStats.peak_tps, { maximumFractionDigits: 2 })
        : null,
    },
    {
      label: t('stats.gasFee'),
      value: txnStats ? (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txnStats.tokens_burnt)}
        </span>
      ) : null,
    },
    {
      label: t('stats.avgGasFee'),
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
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map(({ label, value }) => (
          <Card className="px-4 py-3" key={label}>
            <p className="text-body-xs text-muted-foreground truncate uppercase">
              {label}
            </p>
            <p className="text-headline-base mt-1">
              <SkeletonSlot
                fallback={<Skeleton className="h-5 w-32" />}
                loading={loading || !txnStats}
              >
                {() => <>{value}</>}
              </SkeletonSlot>
            </p>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="text-body-sm p-0">
          <DataTable
            columns={columns}
            data={txns?.data}
            emptyMessage={t('list.empty')}
            getRowKey={(txn) => txn.transaction_hash}
            header={
              <SkeletonSlot
                fallback={<Skeleton className="w-40" />}
                loading={loading || !txnCount}
              >
                {() => (
                  <>
                    {t('list.total', {
                      count: numberFormat(txnCount?.count ?? 0),
                    })}
                  </>
                )}
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
