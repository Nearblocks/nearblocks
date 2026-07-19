'use client';

import { useSearchParams } from 'next/navigation';
import { use } from 'react';

import { FTTxn, FTTxnCountRes, FTTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { TokenAmount, TokenImage, TokenLink } from '@/components/token';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import {
  MethodBadge,
  TxnDirectionIcon,
  TxnDirectionSkeleton,
  TxnStatusIcon,
} from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { countFormat, isApproxCount } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  txnCountPromise?: Promise<FTTxnCountRes>;
  txnsPromise?: Promise<FTTxnsRes>;
};

export const TokenTransfers = ({
  loading,
  txnCountPromise,
  txnsPromise,
}: Props) => {
  const { t } = useLocale('fts');
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  if (txns?.errors?.length) throw new Error('Failed to load transfers');
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;

  const searchParams = useSearchParams();

  const columns: DataTableColumnDef<FTTxn>[] = [
    {
      cell: () => <TxnStatusIcon status />,
      className: 'w-12',
      header: '',
      id: 'status',
      skeletonCell: <Skeleton className="size-5 rounded-full" />,
    },
    {
      cell: (ft) =>
        ft.transaction_hash ? (
          <Link className="text-link" href={`/txns/${ft.transaction_hash}`}>
            <Truncate>
              <TruncateText text={ft.transaction_hash} />
              <TruncateCopy text={ft.transaction_hash} />
            </Truncate>
          </Link>
        ) : (
          <Skeleton className="w-30" />
        ),
      header: t('transfers.txnHash'),
      id: 'txn_hash',
      skeletonWidth: 'w-[85%]',
    },
    {
      cell: (ft) => <MethodBadge text={ft.cause} />,
      header: t('transfers.method'),
      id: 'method',
      skeletonCell: <Skeleton className="h-4.5 w-16 rounded-md" />,
    },
    {
      cell: (ft) => (
        <AccountLink
          account={
            ft.cause === 'BURN'
              ? ft.affected_account_id
              : ft.involved_account_id
          }
        />
      ),
      header: t('transfers.from'),
      id: 'from',
    },
    {
      cell: () => <TxnDirectionIcon />,
      className: 'w-12',
      header: '',
      id: 'direction',
      skeletonCell: <TxnDirectionSkeleton />,
    },
    {
      cell: (ft) => (
        <AccountLink
          account={ft.cause === 'BURN' ? null : ft.affected_account_id}
        />
      ),
      header: t('transfers.to'),
      id: 'to',
    },
    {
      cell: (ft) => (
        <TokenAmount
          amount={ft.delta_amount}
          className="text-foreground"
          decimals={ft.meta?.decimals ?? 0}
          hideSign
        />
      ),
      header: t('transfers.quantity'),
      id: 'quantity',
    },
    {
      cell: (ft) => (
        <span className="flex items-center gap-1">
          <TokenImage
            alt={ft.meta?.name ?? ''}
            className="m-px size-5 rounded-full border"
            src={ft.meta?.icon ?? ''}
          />
          <TokenLink contract={ft.contract_account_id} name={ft.meta?.name} />
        </span>
      ),
      header: t('transfers.token'),
      id: 'token',
    },
    {
      cell: (ft) => <TimestampCell ns={ft.block_timestamp} />,
      cellClassName: 'px-1',
      className: 'w-40',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const params =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `/tokens/transfers?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={txns?.data}
          emptyMessage={t('transfers.empty')}
          getRowKey={(ft) => `${ft.receipt_id}-${ft.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={!!loading}
            >
              {() => {
                const count = txnCount?.data?.count;
                if (!count || count === '0') return null;
                return (
                  <>
                    {t(
                      isApproxCount(count)
                        ? 'transfers.total'
                        : 'transfers.totalExact',
                      { count: countFormat(count) },
                    )}
                  </>
                );
              }}
            </SkeletonSlot>
          }
          loading={!!loading}
          onPaginationNavigate={onPaginate}
          pagination={txns?.meta}
        />
      </CardContent>
    </Card>
  );
};
