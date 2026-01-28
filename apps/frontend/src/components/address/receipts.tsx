'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountReceipt,
  AccountReceiptCount,
  AccountReceiptsRes,
} from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirection, TxnStatusIcon } from '@/components/txn';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { actionMethod } from '@/lib/txn';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  receiptCountPromise?: Promise<AccountReceiptCount | null>;
  receiptsPromise?: Promise<AccountReceiptsRes>;
};

export const Receipts = ({
  loading,
  receiptCountPromise,
  receiptsPromise,
}: Props) => {
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;
  const receiptCount =
    !loading && receiptCountPromise ? use(receiptCountPromise) : null;

  const { address, tab } = useParams<{ address: string; tab: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const onFilter = (value: FilterData) => {
    const params = buildParams(searchParams, value);
    router.push(`/address/${address}/${tab}?${params.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const params = buildParams(searchParams, data);
    router.push(`/address/${address}/${tab}?${params.toString()}`);
  };

  const columns: DataTableColumnDef<AccountReceipt>[] = [
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
      header: 'Receipt ID',
      id: 'receipt_id',
    },
    {
      cell: (receipt) => (
        <Link className="text-link" href={`/txns/${receipt.transaction_hash}`}>
          <Truncate>
            <TruncateText text={receipt.transaction_hash} />
            <TruncateCopy text={receipt.transaction_hash} />
          </Truncate>
        </Link>
      ),
      header: 'Txn Hash',
      id: 'txn_hash',
    },
    {
      cell: (receipt) => (
        <Badge variant="teal">
          <Truncate>
            <TruncateText
              className="max-w-20"
              text={actionMethod(receipt.actions)}
            />
          </Truncate>
        </Badge>
      ),
      header: 'Method',
      id: 'method',
    },
    {
      cell: (receipt) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(receipt.actions_agg?.deposit)}
        </span>
      ),
      header: 'Deposit Value',
      id: 'deposit',
    },
    {
      cell: (receipt) => (
        <AccountLink account={receipt.predecessor_account_id} />
      ),
      enableFilter: true,
      filterName: 'predecessor',
      header: 'From',
      id: 'from',
    },
    {
      cell: (receipt) => (
        <TxnDirection
          address={address}
          from={receipt.predecessor_account_id}
          to={receipt.receiver_account_id}
        />
      ),
      className: 'w-20',
      header: '',
      id: 'direction',
    },
    {
      cell: (receipt) => <AccountLink account={receipt.receiver_account_id} />,
      enableFilter: true,
      filterName: 'receiver',
      header: 'To',
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
      header: 'Block',
      id: 'block',
    },
    {
      cell: (receipt) => <TimestampCell ns={receipt.block?.block_timestamp} />,
      className: 'w-42',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  return (
    <Card>
      <CardHeader className="text-body-sm border-b py-3">
        <SkeletonSlot
          fallback={<Skeleton className="w-40" />}
          loading={loading || !receiptCount}
        >
          {() => (
            <>{`A total of ${numberFormat(
              receiptCount?.count ?? 0,
            )} receipts found`}</>
          )}
        </SkeletonSlot>
      </CardHeader>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={receipts?.data}
          emptyMessage="No receipts found"
          getRowKey={(receipt) => receipt.receipt_id}
          loading={loading || !!receipts?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={(type, cursor) =>
            `/address/${address}/${tab}?${type}=${cursor}`
          }
          pagination={receipts?.meta}
        />
      </CardContent>
    </Card>
  );
};
