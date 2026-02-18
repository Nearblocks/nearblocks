'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { TxnCount, TxnListItem, TxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirectionIcon, TxnStatusIcon } from '@/components/txn';
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
};

export const Txns = ({ loading, txnCountPromise, txnsPromise }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;

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
      header: 'From',
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
      header: 'To',
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
    <>
      <h1 className="text-headline-lg mb-6">
        Latest Near Protocol Transactions
      </h1>
      <Card>
        <CardContent className="text-body-sm p-0">
          <DataTable
            columns={columns}
            data={txns?.data}
            emptyMessage="No transactions found"
            getRowKey={(txn) => txn.transaction_hash}
            header={
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
