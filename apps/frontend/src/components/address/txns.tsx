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
  txnCountPromise?: Promise<AccountTxnCount | null>;
  txnsPromise?: Promise<AccountTxnsRes>;
};

export const Txns = ({ loading, txnCountPromise, txnsPromise }: Props) => {
  const { t } = useLocale('address');
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

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `/address/${address}?${params.toString()}`;
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
      header: t('txns.columns.txnHash'),
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
      header: t('txns.columns.method'),
      id: 'method',
    },
    {
      cell: (txn) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txn.actions_agg?.deposit)}
        </span>
      ),
      header: t('txns.columns.depositValue'),
      id: 'deposit',
    },
    {
      cell: (txn) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(txn.outcomes_agg?.transaction_fee)}
        </span>
      ),
      header: t('txns.columns.txnFee'),
      id: 'txn_fee',
    },
    {
      cell: (txn) => <AccountLink account={txn.signer_account_id} />,
      enableFilter: true,
      filterName: 'signer',
      header: t('txns.columns.from'),
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
          columns={columns}
          data={txns?.data}
          emptyMessage={t('txns.empty')}
          getRowKey={(txn) => txn.transaction_hash}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !txnCount}
            >
              {() => (
                <>
                  {t('txns.total', {
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
  );
};
