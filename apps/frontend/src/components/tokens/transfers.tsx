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
import { TxnDirectionIcon, TxnStatusIcon } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
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
  const txnCount = !loading && txnCountPromise ? use(txnCountPromise) : null;

  const searchParams = useSearchParams();

  const columns: DataTableColumnDef<FTTxn>[] = [
    {
      cell: () => <TxnStatusIcon status />,
      className: 'w-5',
      header: '',
      id: 'status',
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
    },
    {
      cell: (ft) => (
        <Badge variant="teal">
          <Truncate>
            <TruncateText className="max-w-20" text={ft.cause} />
          </Truncate>
        </Badge>
      ),
      header: t('transfers.method'),
      id: 'method',
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

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
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
              loading={loading || !txnCount}
            >
              {() => (
                <>
                  {t('transfers.total', {
                    count: numberFormat(txnCount?.data?.count ?? 0),
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
