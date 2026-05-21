'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { MTTokenTxn, MTTokenTxnCountRes, MTTokenTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { Link } from '@/components/link';
import { AccountLink } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { TokenAmount } from '@/components/token';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirectionIcon, TxnStatusIcon } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { countFormat, isApproxCount, numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  txnCountPromise?: Promise<MTTokenTxnCountRes>;
  txnsPromise?: Promise<MTTokenTxnsRes>;
};

export const MtFtTransfers = ({
  loading,
  txnCountPromise,
  txnsPromise,
}: Props) => {
  const { t } = useLocale('mts');
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const params =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `${pathname}?${params.toString()}`;
  };

  const columns: DataTableColumnDef<MTTokenTxn>[] = [
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
          <Skeleton className="w-30" />
        ),
      header: t('token.tokenTransfers.txnHash'),
      id: 'txn_hash',
    },
    {
      cell: (mt) => (
        <Badge className="text-body-xs px-1.5 py-0.5" variant="teal">
          <Truncate>
            <TruncateText as="code" className="max-w-20" text={mt.cause} />
          </Truncate>
        </Badge>
      ),
      header: t('token.tokenTransfers.method'),
      id: 'method',
    },
    {
      cell: (mt) => (
        <AccountLink
          account={
            mt.cause === 'BURN'
              ? mt.affected_account_id
              : mt.involved_account_id
          }
        />
      ),
      header: t('token.tokenTransfers.from'),
      id: 'from',
    },
    {
      cell: () => <TxnDirectionIcon />,
      className: 'w-12',
      header: '',
      id: 'direction',
    },
    {
      cell: (mt) => (
        <AccountLink
          account={mt.cause === 'BURN' ? null : mt.affected_account_id}
        />
      ),
      header: t('token.tokenTransfers.to'),
      id: 'to',
    },
    {
      cell: (mt) => (
        <TokenAmount
          amount={mt.delta_amount}
          className="text-foreground"
          decimals={mt.base_meta?.decimals ?? 0}
          hideSign
        />
      ),
      header: t('token.tokenTransfers.quantity'),
      id: 'quantity',
    },
    {
      cell: (mt) =>
        mt.block?.block_height ? (
          <Link className="text-link" href={`/blocks/${mt.block.block_height}`}>
            {numberFormat(mt.block.block_height)}
          </Link>
        ) : (
          <Skeleton className="w-20" />
        ),
      header: t('token.tokenTransfers.block'),
      id: 'block',
    },
    {
      cell: (mt) =>
        mt.block?.block_timestamp ? (
          <TimestampCell ns={mt.block.block_timestamp} />
        ) : (
          <Skeleton className="w-20" />
        ),
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
          emptyMessage={t('token.tokenTransfers.empty')}
          getRowKey={(mt) => `${mt.receipt_id}-${mt.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !txnCount}
            >
              {() => {
                const count = txnCount?.data?.count;
                if (!count || count === '0') return null;
                return (
                  <>
                    {t(
                      isApproxCount(count)
                        ? 'token.tokenTransfers.total'
                        : 'token.tokenTransfers.totalExact',
                      { count: countFormat(count) },
                    )}
                  </>
                );
              }}
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
