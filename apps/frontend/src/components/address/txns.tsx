'use client';

import { Download } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountTxn, AccountTxnCount, AccountTxnsRes } from 'nb-schemas';
import { ExportType } from 'nb-types';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { MethodBadge, TxnDirection, TxnStatusIcon } from '@/components/txn';
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
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  address?: string;
  basePath?: string;
  loading?: boolean;
  txnCountPromise?: Promise<AccountTxnCount | null>;
  txnsPromise?: Promise<AccountTxnsRes>;
};

export const Txns = ({
  address: addressProp,
  basePath,
  loading,
  txnCountPromise,
  txnsPromise,
}: Props) => {
  const { t } = useLocale('address');
  const params = useParams<{ address?: string }>();
  const resolvedAddress = addressProp ?? params.address ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  if (txns?.errors?.length) throw new Error('Failed to load transactions');
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;

  const base = basePath ?? `/address/${resolvedAddress}`;

  const onFilter = (value: FilterData) => {
    const p = buildParams(searchParams, value);
    router.push(`${base}?${p.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const p = buildParams(searchParams, data);
    router.push(`${base}?${p.toString()}`);
  };

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const p =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `${base}?${p.toString()}`;
  };

  const accountFilter = basePath ? searchParams.get('account') : null;
  const extraFilters = accountFilter
    ? [
        {
          label: t('txns.columns.account'),
          name: 'account',
          value: accountFilter,
        },
      ]
    : undefined;

  const columns: DataTableColumnDef<AccountTxn>[] = [
    {
      cell: (txn) => <TxnStatusIcon status={txn.outcomes?.status} />,
      className: 'w-12',
      header: '',
      id: 'status',
      skeletonCell: <Skeleton className="size-5 rounded-full" />,
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
      className: 'w-44',
      csvLabel: 'Transaction Hash',
      csvValue: (txn) => txn.transaction_hash,
      header: t('txns.columns.txnHash'),
      id: 'txn_hash',
    },
    {
      cell: (txn) => <MethodBadge text={actionMethod(txn.actions)} />,
      csvLabel: 'Method',
      csvValue: (txn) => actionMethod(txn.actions),
      header: t('txns.columns.method'),
      id: 'method',
      skeletonCell: <Skeleton className="h-4.5 w-[114px] rounded-md" />,
    },
    {
      cell: (txn) => (
        <span className="flex min-w-0 items-center gap-1">
          <NearCircle className="size-4" />
          <span className="truncate">
            {nearFormat(txn.actions_agg?.deposit)}
          </span>
        </span>
      ),
      csvLabel: 'Deposit Value (NEAR)',
      csvValue: (txn) => nearFormat(txn.actions_agg?.deposit),
      header: t('txns.columns.depositValue'),
      id: 'deposit',
    },
    {
      cell: (txn) => <AccountLink account={txn.signer_account_id} />,
      csvLabel: 'From',
      csvValue: (txn) => txn.signer_account_id ?? '',
      enableFilter: true,
      filterName: 'signer',
      filterPlaceholder: t('txns.filterFrom'),
      header: t('txns.columns.from'),
      id: 'from',
    },
    {
      cell: (txn) => (
        <TxnDirection
          address={resolvedAddress}
          from={txn.signer_account_id}
          to={txn.receiver_account_id}
        />
      ),
      className: 'w-20',
      header: '',
      id: 'direction',
      skeletonCell: <Skeleton className="h-4.5 w-12.5 rounded-md" />,
    },
    {
      cell: (txn) => <AccountLink account={txn.receiver_account_id} />,
      csvLabel: 'To',
      csvValue: (txn) => txn.receiver_account_id ?? '',
      enableFilter: true,
      filterName: 'receiver',
      filterPlaceholder: t('txns.filterTo'),
      header: t('txns.columns.to'),
      id: 'to',
    },
    {
      cell: (txn) => (
        <Link className="text-link" href={`/blocks/${txn.block?.block_hash}`}>
          {numberFormat(txn.block?.block_height)}
        </Link>
      ),
      header: t('txns.columns.block'),
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

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          actions={
            !basePath && (
              <Button asChild size="xs" variant="outline">
                <Link
                  href={`/export-csv?account=${resolvedAddress}&type=${ExportType.TRANSACTIONS}`}
                >
                  <Download className="size-3" />
                  {t('csvExport')}
                </Link>
              </Button>
            )
          }
          columns={columns}
          data={txns?.data}
          downloadFilename={
            resolvedAddress ? `nearblocks-txns-${resolvedAddress}` : undefined
          }
          emptyMessage={t('txns.empty')}
          extraFilters={extraFilters}
          getRowKey={(txn) => txn.transaction_hash}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={!!loading}
            >
              {() => {
                const count = txnCount?.count;
                if (!count || count === '0') return null;
                return t(
                  isApproxCount(count) ? 'txns.total' : 'txns.totalExact',
                  { count: countFormat(count) },
                );
              }}
            </SkeletonSlot>
          }
          loading={!!loading}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={basePath ? onPaginate : undefined}
          pagination={basePath ? txns?.meta : undefined}
        />
        {/* Reserved while loading: the main-tab embed almost always has a
            next page, so the footer vanishing would shift the layout. */}
        {loading && !basePath && (
          <div className="border-t px-4 py-3">
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {!basePath && txns?.meta?.next_page && (
          <div className="border-t px-4 py-3">
            <Button asChild className="h-8 w-full" variant="ghost">
              <Link href={`/txns?account=${resolvedAddress}`}>
                {t('txns.viewAll')}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
