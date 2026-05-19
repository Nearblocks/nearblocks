'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { Receipt, ReceiptCount, ReceiptsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
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
  receiptCountPromise?: Promise<null | ReceiptCount>;
  receiptsPromise?: Promise<ReceiptsRes>;
};

export const Receipts = ({
  loading,
  receiptCountPromise,
  receiptsPromise,
}: Props) => {
  const { t } = useLocale('receipts');
  const router = useRouter();
  const searchParams = useSearchParams();
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;
  const receiptCount =
    !loading && receiptCountPromise ? use(receiptCountPromise) : null;

  const columns: DataTableColumnDef<Receipt>[] = [
    {
      cell: (receipt) => <TxnStatusIcon status={receipt.outcome?.status} />,
      className: 'w-5',
      header: '',
      id: 'status',
    },
    {
      cell: (receipt) => (
        <Link
          className="text-link"
          href={`/txns/${receipt.transaction_hash}/execution#${receipt.receipt_id}`}
        >
          <Truncate>
            <TruncateText text={receipt.receipt_id} />
            <TruncateCopy text={receipt.receipt_id} />
          </Truncate>
        </Link>
      ),
      header: t('list.receiptId'),
      id: 'receipt_id',
    },
    {
      cell: (receipt) => (
        <Badge className="text-body-xs px-1.5 py-0.5" variant="teal">
          <Truncate>
            <TruncateText
              as="code"
              className="max-w-20"
              text={actionMethod(receipt.actions)}
            />
          </Truncate>
        </Badge>
      ),
      header: t('list.method'),
      id: 'method',
    },
    {
      cell: (receipt) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(receipt.actions_agg?.deposit)}
        </span>
      ),
      header: t('list.deposit'),
      id: 'deposit',
    },
    {
      cell: (receipt) => (
        <AccountLink account={receipt.predecessor_account_id} />
      ),
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
      cell: (receipt) => <AccountLink account={receipt.receiver_account_id} />,
      header: t('list.to'),
      id: 'to',
    },
    {
      cell: (receipt) => (
        <Link
          className="text-link"
          href={`/blocks/${receipt.block?.block_hash}`}
        >
          {numberFormat(receipt.block?.block_height)}
        </Link>
      ),
      enableFilter: true,
      filterName: 'block',
      filterPlaceholder: t('list.filterBlock'),
      header: t('list.block'),
      id: 'block',
    },
    {
      cell: (receipt) => <TimestampCell ns={receipt.block?.block_timestamp} />,
      cellClassName: 'px-1',
      className: 'w-40',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const onFilter = (value: FilterData) => {
    const params = buildParams(searchParams, value);
    router.push(`/receipts?${params.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const params = buildParams(searchParams, data);
    router.push(`/receipts?${params.toString()}`);
  };

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const params =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `/receipts?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={receipts?.data}
          emptyMessage={t('list.empty')}
          getRowKey={(receipt) => receipt.receipt_id}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !receiptCount}
            >
              {() => {
                const count = receiptCount?.count;
                if (!count || count === '0') return null;
                return t(
                  isApproxCount(count) ? 'list.total' : 'list.totalExact',
                  { count: countFormat(count) },
                );
              }}
            </SkeletonSlot>
          }
          loading={loading || !!receipts?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={onPaginate}
          pagination={receipts?.meta}
        />
      </CardContent>
    </Card>
  );
};
