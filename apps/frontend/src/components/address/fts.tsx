'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountFTTxn, AccountFTTxnCount, AccountFTTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { TokenAmount, TokenImage, TokenLink } from '@/components/token';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirection, TxnStatusIcon } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  ftCountPromise?: Promise<AccountFTTxnCount | null>;
  ftsPromise?: Promise<AccountFTTxnsRes>;
  loading?: boolean;
};

export const FTTxns = ({ ftCountPromise, ftsPromise, loading }: Props) => {
  const { t } = useLocale('address');
  const fts = !loading && ftsPromise ? use(ftsPromise) : null;
  const ftCount = !loading && ftCountPromise ? use(ftCountPromise) : null;

  const columns: DataTableColumnDef<AccountFTTxn>[] = [
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
      header: t('fts.columns.txnHash'),
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
      enableFilter: true,
      filterName: 'cause',
      filterPlaceholder: t('fts.filterMethod'),
      header: t('fts.columns.method'),
      id: 'cause',
    },
    {
      cell: (ft) => <AccountLink account={ft.affected_account_id} />,
      header: t('fts.columns.affected'),
      id: 'affected',
    },
    {
      cell: (ft) => <TxnDirection amount={ft.delta_amount} />,
      className: 'w-20',
      header: '',
      id: 'direction',
    },
    {
      cell: (ft) => <AccountLink account={ft.involved_account_id} />,
      enableFilter: true,
      filterName: 'involved',
      filterPlaceholder: t('fts.filterInvolved'),
      header: t('fts.columns.involved'),
      id: 'involved',
    },
    {
      cell: (ft) => (
        <TokenAmount
          amount={ft.delta_amount}
          decimals={ft.meta?.decimals ?? 0}
        />
      ),
      header: t('fts.columns.quantity'),
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
      enableFilter: true,
      filterName: 'token',
      filterPlaceholder: t('fts.filterToken'),
      header: t('fts.columns.token'),
      id: 'token',
    },
    {
      cell: (ft) =>
        ft.block?.block_timestamp ? (
          <TimestampCell ns={ft.block?.block_timestamp} />
        ) : (
          <Skeleton className="w-30" />
        ),
      cellClassName: 'px-1',
      className: 'w-40',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const { address } = useParams<{ address: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const onFilter = (value: FilterData) => {
    const params = buildParams(searchParams, value);
    router.push(`/address/${address}/tokens?${params.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const params = buildParams(searchParams, data);
    router.push(`/address/${address}/tokens?${params.toString()}`);
  };

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `/address/${address}/tokens?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={fts?.data}
          emptyMessage={t('fts.empty')}
          getRowKey={(ft) => `${ft.receipt_id}-${ft.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !ftCount}
            >
              {() => (
                <>
                  {t('fts.total', { count: numberFormat(ftCount?.count ?? 0) })}
                </>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!fts?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={onPaginate}
          pagination={fts?.meta}
        />
      </CardContent>
    </Card>
  );
};
