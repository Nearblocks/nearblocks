'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountMTTxn, AccountMTTxnCount, AccountMTTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
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
  mtCountPromise?: Promise<AccountMTTxnCount | null>;
  mtsPromise?: Promise<AccountMTTxnsRes>;
};

export const MTTxns = ({ loading, mtCountPromise, mtsPromise }: Props) => {
  const { t } = useLocale('address');
  const mts = !loading && mtsPromise ? use(mtsPromise) : null;
  const mtCount = !loading && mtCountPromise ? use(mtCountPromise) : null;

  const columns: DataTableColumnDef<AccountMTTxn>[] = [
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
      header: t('mts.columns.txnHash'),
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
      enableFilter: true,
      filterName: 'cause',
      header: t('mts.columns.method'),
      id: 'cause',
    },
    {
      cell: (mt) => (
        <AccountLink
          account={mt.affected_account_id}
          textClassName="max-w-25"
        />
      ),
      header: t('mts.columns.affected'),
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
      enableFilter: true,
      filterName: 'involved',
      header: t('mts.columns.involved'),
      id: 'involved',
    },
    {
      cell: (mt) => (
        <TokenAmount
          amount={mt.delta_amount}
          decimals={mt.base_meta?.decimals ?? 0}
        />
      ),
      header: t('mts.columns.quantity'),
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
      header: t('mts.columns.token'),
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

  const { address } = useParams<{ address: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const onFilter = (value: FilterData) => {
    const params = buildParams(searchParams, value);
    router.push(`/address/${address}/mt-tokens?${params.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const params = buildParams(searchParams, data);
    router.push(`/address/${address}/mt-tokens?${params.toString()}`);
  };

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `/address/${address}/mt-tokens?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={mts?.data}
          emptyMessage={t('mts.empty')}
          getRowKey={(mt) => `${mt.receipt_id}-${mt.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !mtCount}
            >
              {() => (
                <>
                  {t('mts.total', { count: numberFormat(mtCount?.count ?? 0) })}
                </>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!mts?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={onPaginate}
          pagination={mts?.meta}
        />
      </CardContent>
    </Card>
  );
};
