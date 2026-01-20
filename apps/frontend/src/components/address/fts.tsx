'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountFTTxn, AccountFTTxnCount, AccountFTTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { TokenAmount, TokenImage } from '@/components/token';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirection, TxnStatusIcon } from '@/components/txn';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  ftCountPromise?: Promise<AccountFTTxnCount | null>;
  ftsPromise?: Promise<AccountFTTxnsRes>;
  loading?: boolean;
};

export const FTTxns = ({ ftCountPromise, ftsPromise, loading }: Props) => {
  const fts = !loading && ftsPromise ? use(ftsPromise) : null;
  const ftCount = !loading && ftCountPromise ? use(ftCountPromise) : null;

  const { address, tab } = useParams<{ address: string; tab: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const onFilter = (value: FilterData) => {
    const params = buildParams(searchParams, value);
    router.push(`/address/${address}/${tab}?${params.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const params = buildParams(searchParams, data);
    router.push(`/address/${address}/${tab}?${params.toString()}`);
  };

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
      header: 'Txn Hash',
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
      header: 'Method',
      id: 'cause',
    },
    {
      cell: (ft) => (
        <Link className="text-link" href={`/address/${ft.affected_account_id}`}>
          <Truncate>
            <TruncateText text={ft.affected_account_id} />
            <TruncateCopy text={ft.affected_account_id} />
          </Truncate>
        </Link>
      ),
      header: 'Affected',
      id: 'affected',
    },
    {
      cell: (ft) => <TxnDirection amount={ft.delta_amount} />,
      className: 'w-20',
      header: '',
      id: 'direction',
    },
    {
      cell: (ft) =>
        ft.involved_account_id ? (
          <Link
            className="text-link"
            href={`/address/${ft.involved_account_id}`}
          >
            <Truncate>
              <TruncateText text={ft.involved_account_id} />
              <TruncateCopy text={ft.involved_account_id} />
            </Truncate>
          </Link>
        ) : (
          'system'
        ),
      enableFilter: true,
      filterName: 'involved',
      header: 'Involved',
      id: 'involved',
    },
    {
      cell: (ft) => (
        <TokenAmount
          amount={ft.delta_amount}
          decimals={ft.meta?.decimals ?? 0}
        />
      ),
      header: 'Quantity',
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
          <Link className="text-link" href={`/token/${ft.contract_account_id}`}>
            <Truncate>
              <TruncateText text={ft.meta?.name ?? ''} />
              <TruncateCopy text={ft.contract_account_id} />
            </Truncate>
          </Link>
        </span>
      ),
      enableFilter: true,
      filterName: 'token',
      header: 'Token',
      id: 'token',
    },
    {
      cell: (ft) =>
        ft.block?.block_timestamp ? (
          <TimestampCell ns={ft.block?.block_timestamp} />
        ) : (
          <Skeleton className="w-30" />
        ),
      className: 'w-42',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  return (
    <Card>
      <CardHeader className="text-body-sm border-b py-3">
        <SkeletonSlot
          fallback={<Skeleton className="w-40" />}
          loading={loading || !ftCount}
        >
          {() => (
            <>{`A total of ${numberFormat(
              ftCount?.count ?? 0,
            )} token txns found`}</>
          )}
        </SkeletonSlot>
      </CardHeader>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={fts?.data}
          emptyMessage="No token txns found"
          getRowKey={(ft) => `${ft.receipt_id}-${ft.event_index}`}
          loading={loading || !!fts?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={(type, cursor) =>
            `/address/${address}/${tab}?${type}=${cursor}`
          }
          pagination={fts?.meta}
        />
      </CardContent>
    </Card>
  );
};
