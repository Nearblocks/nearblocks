'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountMTTxn, AccountMTTxnCount, AccountMTTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
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
  loading?: boolean;
  mtCountPromise?: Promise<AccountMTTxnCount | null>;
  mtsPromise?: Promise<AccountMTTxnsRes>;
};

export const MTTxns = ({ loading, mtCountPromise, mtsPromise }: Props) => {
  const mts = !loading && mtsPromise ? use(mtsPromise) : null;
  const mtCount = !loading && mtCountPromise ? use(mtCountPromise) : null;

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
      header: 'Txn Hash',
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
      header: 'Method',
      id: 'cause',
    },
    {
      cell: (mt) => (
        <AccountLink
          account={mt.affected_account_id}
          textClassName="max-w-25"
        />
      ),
      header: 'Affected',
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
      header: 'Involved',
      id: 'involved',
    },
    {
      cell: (mt) => (
        <TokenAmount
          amount={mt.delta_amount}
          decimals={mt.base_meta?.decimals ?? 0}
        />
      ),
      header: 'Quantity',
      id: 'quantity',
    },
    {
      cell: (mt) => (
        <Link
          className="text-link"
          href={`/mt-token/${mt.contract_account_id}/${mt.token_id}`}
        >
          <Truncate>
            <TruncateText className="max-w-25" text={mt.token_id} />
            <TruncateCopy text={mt.token_id} />
          </Truncate>
        </Link>
      ),
      header: 'Token ID',
      id: 'token_id',
    },
    {
      cell: (mt) => (
        <span className="flex items-center gap-1">
          <TokenImage
            alt={mt.meta?.name ?? ''}
            className="m-px size-5 rounded-full border"
            src={mt.base_meta?.icon ?? ''}
          />
          <Link
            className="text-link"
            href={`/mt-token/${mt.contract_account_id}`}
          >
            <Truncate>
              <TruncateText
                className="max-w-22"
                text={mt.contract_account_id}
              />
              <TruncateCopy text={mt.contract_account_id} />
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
      cell: (mt) =>
        mt.block?.block_timestamp ? (
          <TimestampCell ns={mt.block.block_timestamp} />
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
          loading={loading || !mtCount}
        >
          {() => (
            <>{`A total of ${numberFormat(
              mtCount?.count ?? 0,
            )} mt token txns found`}</>
          )}
        </SkeletonSlot>
      </CardHeader>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={mts?.data}
          emptyMessage="No mt token txns found"
          getRowKey={(mt) => `${mt.receipt_id}-${mt.event_index}`}
          loading={loading || !!mts?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={(type, cursor) =>
            `/address/${address}/${tab}?${type}=${cursor}`
          }
          pagination={mts?.meta}
        />
      </CardContent>
    </Card>
  );
};
