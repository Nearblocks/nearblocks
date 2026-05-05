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
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  address?: string;
  basePath?: string;
  loading?: boolean;
  mtCountPromise?: Promise<AccountMTTxnCount | null>;
  mtsPromise?: Promise<AccountMTTxnsRes>;
};

export const MTTxns = ({
  address: addressProp,
  basePath,
  loading,
  mtCountPromise,
  mtsPromise,
}: Props) => {
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
      filterPlaceholder: t('mts.filterMethod'),
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
      filterPlaceholder: t('mts.filterInvolved'),
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

  const params = useParams<{ address?: string }>();
  const resolvedAddress = addressProp ?? params.address ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = basePath ?? `/address/${resolvedAddress}/mt-tokens`;

  const onFilter = (value: FilterData) => {
    const p = buildParams(searchParams, value);
    router.push(`${base}?${p.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const p = buildParams(searchParams, data);
    router.push(`${base}?${p.toString()}`);
  };

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const p = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `${base}?${p.toString()}`;
  };

  const accountFilter = basePath ? searchParams.get('account') : null;
  const extraFilters = accountFilter
    ? [
        {
          label: t('txns.columns.account'),
          name: 'account',
          value: accountFilter,
        },
      ]
    : undefined;

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={mts?.data}
          emptyMessage={t('mts.empty')}
          extraFilters={extraFilters}
          getRowKey={(mt) => `${mt.receipt_id}-${mt.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !mtCount}
            >
              {() => (
                <>
                  {basePath ? (
                    t('mts.total', {
                      count: numberFormat(mtCount?.count ?? 0),
                    })
                  ) : mts?.data?.length ? (
                    t('mts.latest')
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!mts?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={onPaginate}
          pagination={basePath ? mts?.meta : undefined}
        />
        {!basePath && mts?.meta?.next_page && (
          <div className="border-t px-4 py-3">
            <Button asChild className="h-8 w-full" variant="ghost">
              <Link href={`/mt-tokens/transfers?account=${resolvedAddress}`}>
                {t('mts.viewAll')}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
