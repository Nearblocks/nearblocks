'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountTxnCount, AccountTxnsRes } from 'nb-schemas';

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
  txnCountPromise?: Promise<AccountTxnCount | null>;
  txnsPromise?: Promise<AccountTxnsRes>;
};

type TxnRow = NonNullable<AccountTxnsRes['data']>[number];

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

  const columns: DataTableColumnDef<TxnRow>[] = [
    {
      cell: (txn) => <TxnStatusIcon status={txn.outcomes?.status} />,
      className: 'w-[20px]',
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
              text={txn.actions?.[0]?.method ?? ''}
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
          {nearFormat(txn.outcomes_agg?.transaction_fee)}
        </span>
      ),
      header: 'Txn Fee',
      id: 'txn_fee',
    },
    {
      cell: (txn) => (
        <Link className="text-link" href={`/address/${txn.signer_account_id}`}>
          <Truncate>
            <TruncateText text={txn.signer_account_id} />
            <TruncateCopy text={txn.signer_account_id} />
          </Truncate>
        </Link>
      ),
      enableFilter: true,
      filterName: 'signer',
      header: 'From',
      id: 'from',
    },
    {
      cell: (txn) => (
        <Link
          className="text-link"
          href={`/address/${txn.receiver_account_id}`}
        >
          <Truncate>
            <TruncateText text={txn.receiver_account_id} />
            <TruncateCopy text={txn.receiver_account_id} />
          </Truncate>
        </Link>
      ),
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
      cell: (txn) => <TimeAgo ns={txn.block?.block_timestamp} />,
      header: 'Age',
      id: 'age',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={txns?.data}
      emptyMessage="No transactions found"
      getRowKey={(txn) => txn.transaction_hash}
      header={
        <>{`A total of ${numberFormat(
          txnCount?.count ?? 0,
        )} transactions found`}</>
      }
      loading={loading || !txnCount || !txnCount?.count}
      onClear={onClear}
      onFilter={onFilter}
      onPaginationNavigate={(type, page) =>
        `/address/${address}?${type}=${page}`
      }
      pagination={txns?.meta}
    />
  );
};
