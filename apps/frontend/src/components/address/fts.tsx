'use client';

import { Download } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountFTTxn, AccountFTTxnCount, AccountFTTxnsRes } from 'nb-schemas';
import { ExportType } from 'nb-types';

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
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  address?: string;
  basePath?: string;
  ftCountPromise?: Promise<AccountFTTxnCount | null>;
  ftsPromise?: Promise<AccountFTTxnsRes>;
  loading?: boolean;
};

export const FTTxns = ({
  address: addressProp,
  basePath,
  ftCountPromise,
  ftsPromise,
  loading,
}: Props) => {
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
      filterName: 'contract',
      filterPlaceholder: t('fts.filterContract'),
      header: t('fts.columns.token'),
      id: 'contract',
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

  const params = useParams<{ address?: string }>();
  const resolvedAddress = addressProp ?? params.address ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = basePath ?? `/address/${resolvedAddress}/tokens`;

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
          actions={
            <Button asChild size="xs" variant="outline">
              <Link
                href={`/export-csv?account=${resolvedAddress}&type=${ExportType.FT_TRANSFERS}`}
              >
                <Download className="size-3" />
                {t('csvExport')}
              </Link>
            </Button>
          }
          columns={columns}
          data={fts?.data}
          emptyMessage={t('fts.empty')}
          extraFilters={extraFilters}
          getRowKey={(ft) => `${ft.receipt_id}-${ft.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !ftCount}
            >
              {() => (
                <>
                  {basePath ? (
                    t('fts.total', {
                      count: numberFormat(ftCount?.count ?? 0),
                    })
                  ) : fts?.data?.length ? (
                    t('fts.latest', { count: numberFormat(fts.data.length) })
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!fts?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={onPaginate}
          pagination={basePath ? fts?.meta : undefined}
        />
        {!basePath && fts?.meta?.next_page && (
          <div className="border-t px-4 py-3">
            <Button asChild className="h-8 w-full" variant="ghost">
              <Link href={`/tokens/transfers?account=${resolvedAddress}`}>
                {t('fts.viewAll')}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
