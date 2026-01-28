'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountTxn, AccountTxnCount, AccountTxnsRes } from 'nb-schemas';

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
  txnCountPromise?: Promise<AccountTxnCount | null>;
  txnsPromise?: Promise<AccountTxnsRes>;
};

export const Txns = ({ loading, txnCountPromise, txnsPromise }: Props) => {
  const { address } = useParams<{ address: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;

  const onFilter = (value: FilterData) => {
    const params = buildParams(searchParams, value);
    router.push(`/address/${address}?${params.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const params = buildParams(searchParams, data);
    router.push(`/address/${address}?${params.toString()}`);
  };

  const columns: DataTableColumnDef<AccountTxn>[] = [
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
      header: 'Txn Hash',
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
      header: 'Method',
      id: 'method',
    },
    {
      cell: (txn) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txn.actions_agg?.deposit)}
        </span>
      ),
      header: 'Deposit Value',
      id: 'deposit',
    },
    {
      cell: (txn) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txn.outcomes_agg?.transaction_fee) ?? '0'}
        </span>
      ),
      header: 'Txn Fee',
      id: 'txn_fee',
    },
    {
      cell: (txn) => <AccountLink account={txn.signer_account_id} />,
      enableFilter: true,
      filterName: 'signer',
      header: 'From',
      id: 'from',
    },
    {
      cell: (txn) => (
        <TxnDirection
          address={address}
          from={txn.signer_account_id}
          to={txn.receiver_account_id}
        />
      ),
      className: 'w-20',
      header: '',
      id: 'direction',
    },
    {
      cell: (txn) => <AccountLink account={txn.receiver_account_id} />,
      enableFilter: true,
      filterName: 'receiver',
      header: 'To',
      id: 'to',
    },
    {
      cell: (txn) => (
        <Link className="text-link" href={`/blocks/${txn.block?.block_hash}`}>
          {numberFormat(txn.block?.block_height)}
        </Link>
      ),
      header: 'Block',
      id: 'block',
    },
    {
      cell: (txn) => <TimestampCell ns={txn.block?.block_timestamp} />,
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
          loading={loading || !txnCount}
        >
          {() => (
            <>{`A total of ${numberFormat(
              txnCount?.count ?? 0,
            )} transactions found`}</>
          )}
        </SkeletonSlot>
      </CardHeader>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={txns?.data}
          emptyMessage="No transactions found"
          getRowKey={(txn) => txn.transaction_hash}
          loading={loading || !!txns?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={(type, cursor) =>
            `/address/${address}?${type}=${cursor}`
          }
          pagination={txns?.meta}
        />
      </CardContent>
    </Card>
  );
};
