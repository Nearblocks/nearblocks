'use client';

import { Download } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountMTTxn, AccountMTTxnCount, AccountMTTxnsRes } from 'nb-schemas';
import { ExportType } from 'nb-types';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { MTTokenLink, TokenAmount, TokenImage } from '@/components/token';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { MethodBadge, TxnDirection, TxnStatusIcon } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import {
  countFormat,
  isApproxCount,
  toTimestampCsv,
  toTokenAmountCsv,
} from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

const mtFrom = (mt: AccountMTTxn) =>
  Number(mt.delta_amount) < 0 ? mt.affected_account_id : mt.involved_account_id;

const mtTo = (mt: AccountMTTxn) =>
  Number(mt.delta_amount) < 0 ? mt.involved_account_id : mt.affected_account_id;

type Props = {
  address?: string;
  basePath?: string;
  loading?: boolean;
  mtCountPromise?: Promise<AccountMTTxnCount | null>;
  mtsPromise?: Promise<AccountMTTxnsRes>;
};

export const MTTxns = ({
  address: addressProp,
  basePath,
  loading,
  mtCountPromise,
  mtsPromise,
}: Props) => {
  const { t } = useLocale('address');
  const mts = !loading && mtsPromise ? use(mtsPromise) : null;
  if (mts?.errors?.length) throw new Error('Failed to load token transfers');
  const mtCount = !loading && mtCountPromise ? use(mtCountPromise) : null;

  const columns: DataTableColumnDef<AccountMTTxn>[] = [
    {
      cell: () => <TxnStatusIcon status />,
      className: 'w-12',
      header: '',
      id: 'status',
      skeletonCell: <Skeleton className="size-5 rounded-full" />,
    },
    {
      cell: (mt) =>
        mt.transaction_hash ? (
          <Link className="text-link" href={`/txns/${mt.transaction_hash}`}>
            <Truncate>
              <TruncateText text={mt.transaction_hash} />
              <TruncateCopy text={mt.transaction_hash} />
            </Truncate>
          </Link>
        ) : (
          <Skeleton className="w-30" />
        ),
      className: 'w-44',
      csvLabel: 'Transaction Hash',
      csvValue: (mt) => mt.transaction_hash ?? '',
      header: t('mts.columns.txnHash'),
      id: 'txn_hash',
    },
    {
      cell: (mt) => <MethodBadge text={mt.cause} />,
      csvLabel: 'Method',
      csvValue: (mt) => mt.cause ?? '',
      enableFilter: true,
      filterName: 'cause',
      filterPlaceholder: t('mts.filterMethod'),
      header: t('mts.columns.method'),
      id: 'cause',
      skeletonCell: <Skeleton className="h-4.5 w-[103px] rounded-md" />,
    },
    {
      cell: (mt) => (
        <AccountLink account={mtFrom(mt)} textClassName="max-w-25" />
      ),
      csvLabel: 'From',
      csvValue: (mt) => mtFrom(mt) ?? '',
      header: t('mts.columns.from'),
      id: 'from',
    },
    {
      cell: (mt) => <TxnDirection amount={mt.delta_amount} />,
      className: 'w-20',
      header: '',
      id: 'direction',
      skeletonCell: <Skeleton className="h-4.5 w-12.5 rounded-md" />,
    },
    {
      cell: (mt) => <AccountLink account={mtTo(mt)} textClassName="max-w-25" />,
      csvLabel: 'To',
      csvValue: (mt) => mtTo(mt) ?? '',
      header: t('mts.columns.to'),
      id: 'to',
    },
    {
      cell: (mt) => (
        <TokenAmount
          amount={mt.delta_amount}
          decimals={mt.base_meta?.decimals ?? 0}
        />
      ),
      csvLabel: 'Quantity',
      csvValue: (mt) =>
        toTokenAmountCsv(mt.delta_amount, mt.base_meta?.decimals ?? 0),
      header: t('mts.columns.quantity'),
      id: 'quantity',
    },
    {
      cell: (mt) => (
        <span className="flex items-center gap-1">
          <TokenImage
            alt={mt.meta?.name ?? ''}
            className="m-px size-5 rounded-full border"
            src={mt.token_meta?.media ?? mt.base_meta?.icon ?? ''}
          />
          <MTTokenLink
            contract={mt.contract_account_id}
            decimals={mt.base_meta?.decimals}
            name={mt.token_meta?.title ?? mt.base_meta?.name}
            symbol={mt.base_meta?.symbol}
            token={mt.token_id}
          />
        </span>
      ),
      csvLabel: 'Token',
      csvValue: (mt) =>
        mt.token_meta?.title ?? mt.base_meta?.name ?? mt.contract_account_id,
      enableFilter: true,
      filterName: 'contract',
      filterPlaceholder: t('mts.filterContract'),
      header: t('mts.columns.token'),
      id: 'token',
    },
    {
      cell: (mt) =>
        mt.block?.block_timestamp ? (
          <TimestampCell ns={mt.block.block_timestamp} />
        ) : (
          <Skeleton className="w-30" />
        ),
      cellClassName: 'px-1',
      className: 'w-40',
      csvLabel: 'Timestamp (UTC)',
      csvValue: (mt) => toTimestampCsv(mt.block?.block_timestamp),
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const params = useParams<{ address?: string }>();
  const resolvedAddress = addressProp ?? params.address ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = basePath ?? `/address/${resolvedAddress}/mt-tokens`;

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

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          actions={
            !basePath && (
              <Button asChild size="xs" variant="outline">
                <Link
                  href={`/export-csv?account=${resolvedAddress}&type=${ExportType.MT_TRANSFERS}`}
                >
                  <Download className="size-3" />
                  {t('csvExport')}
                </Link>
              </Button>
            )
          }
          columns={columns}
          data={mts?.data}
          downloadFilename={
            resolvedAddress
              ? `nearblocks-mt-txns-${resolvedAddress}`
              : undefined
          }
          emptyMessage={t('mts.empty')}
          extraFilters={extraFilters}
          getRowKey={(mt) => `${mt.receipt_id}-${mt.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={!!loading}
            >
              {() => {
                const count = mtCount?.count;
                if (!count || count === '0') return null;
                return t(
                  isApproxCount(count) ? 'mts.total' : 'mts.totalExact',
                  { count: countFormat(count) },
                );
              }}
            </SkeletonSlot>
          }
          loading={!!loading}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={basePath ? onPaginate : undefined}
          pagination={basePath ? mts?.meta : undefined}
        />
        {loading && !basePath && (
          <div className="border-t px-4 py-3">
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {!basePath && mts?.meta?.next_page && (
          <div className="border-t px-4 py-3">
            <Button asChild className="h-8 w-full" variant="ghost">
              <Link href={`/mt-tokens/transfers?account=${resolvedAddress}`}>
                {t('mts.viewAll')}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
