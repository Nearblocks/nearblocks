'use client';

import { useSearchParams } from 'next/navigation';
import { use } from 'react';

import { MTTxn, MTTxnCount, MTTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { MTLink, TokenAmount, TokenImage } from '@/components/token';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirection, TxnStatusIcon } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  txnCountPromise?: Promise<MTTxnCount | null>;
  txnsPromise?: Promise<MTTxnsRes>;
};

export const MtTokenTransfers = ({
  loading,
  txnCountPromise,
  txnsPromise,
}: Props) => {
  const { t } = useLocale('mts');
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;

  const searchParams = useSearchParams();

  const columns: DataTableColumnDef<MTTxn>[] = [
    {
      cell: () => <TxnStatusIcon status />,
      className: 'w-5',
      header: '',
      id: 'status',
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
          <Skeleton className="w-25" />
        ),
      header: t('transfers.txnHash'),
      id: 'txn_hash',
    },
    {
      cell: (mt) => (
        <Badge variant="teal">
          <Truncate>
            <TruncateText className="max-w-20" text={mt.cause} />
          </Truncate>
        </Badge>
      ),
      header: t('transfers.method'),
      id: 'method',
    },
    {
      cell: (mt) => (
        <AccountLink
          account={mt.affected_account_id}
          textClassName="max-w-25"
        />
      ),
      header: t('transfers.affected'),
      id: 'affected',
    },
    {
      cell: (mt) => <TxnDirection amount={mt.delta_amount} />,
      className: 'w-20',
      header: '',
      id: 'direction',
    },
    {
      cell: (mt) => (
        <AccountLink
          account={mt.involved_account_id}
          textClassName="max-w-25"
        />
      ),
      header: t('transfers.involved'),
      id: 'involved',
    },
    {
      cell: (mt) => (
        <TokenAmount
          amount={mt.delta_amount}
          decimals={mt.base_meta?.decimals ?? 0}
        />
      ),
      header: t('transfers.quantity'),
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
          <MTLink
            contract={mt.contract_account_id}
            name={mt.token_meta?.title ?? mt.base_meta?.name}
            symbol={mt.base_meta?.symbol}
            token={mt.token_id}
            type="token"
          />
        </span>
      ),
      header: t('transfers.token'),
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
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `/mt-tokens/transfers?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={txns?.data}
          emptyMessage={t('transfers.empty')}
          getRowKey={(mt) => `${mt.receipt_id}-${mt.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !txnCount}
            >
              {() => (
                <>
                  {t('transfers.total', {
                    count: numberFormat(txnCount?.count ?? 0),
                  })}
                </>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!txns?.errors}
          onPaginationNavigate={onPaginate}
          pagination={txns?.meta}
        />
      </CardContent>
    </Card>
  );
};
