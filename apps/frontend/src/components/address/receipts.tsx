'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountReceiptCount, AccountReceiptsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { Link } from '@/components/link';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimeAgo } from '@/components/time-ago';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnStatusIcon } from '@/components/txn-status';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';

type Props = {
  loading?: boolean;
  receiptCountPromise?: Promise<AccountReceiptCount | null>;
  receiptsPromise?: Promise<AccountReceiptsRes>;
};

type ReceiptRow = NonNullable<AccountReceiptsRes['data']>[number];

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

  const columns: DataTableColumnDef<ReceiptRow>[] = [
    {
      cell: (receipt) => <TxnStatusIcon status={receipt.outcome?.status} />,
      className: 'w-[20px]',
      header: '',
      id: 'status',
    },
    {
      cell: (receipt) => (
        <Link className="text-link" href={`/receipts/${receipt.receipt_id}`}>
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
        <Link
          className="text-link"
          href={`/receipts/${receipt.transaction_hash}`}
        >
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
              text={receipt.actions?.[0]?.method ?? ''}
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
        <Link
          className="text-link"
          href={`/address/${receipt.predecessor_account_id}`}
        >
          <Truncate>
            <TruncateText text={receipt.predecessor_account_id} />
            <TruncateCopy text={receipt.predecessor_account_id} />
          </Truncate>
        </Link>
      ),
      enableFilter: true,
      filterName: 'predecessor',
      header: 'From',
      id: 'from',
    },
    {
      cell: (receipt) => (
        <Link
          className="text-link"
          href={`/address/${receipt.receiver_account_id}`}
        >
          <Truncate>
            <TruncateText text={receipt.receiver_account_id} />
            <TruncateCopy text={receipt.receiver_account_id} />
          </Truncate>
        </Link>
      ),
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
      cell: (receipt) => <TimeAgo ns={receipt.block?.block_timestamp} />,
      header: 'Age',
      id: 'age',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={receipts?.data}
      emptyMessage="No transactions found"
      getRowKey={(receipt) => receipt.receipt_id}
      header={
        <>{`A total of ${numberFormat(
          receiptCount?.count ?? 0,
        )} receipts found`}</>
      }
      loading={loading || !receiptCount || !receiptCount?.count}
      onClear={onClear}
      onFilter={onFilter}
      onPaginationNavigate={(type, page) =>
        `/address/${address}/${tab}?${type}=${page}`
      }
      pagination={receipts?.meta}
    />
  );
};
