'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { FTTxn, FTTxnCountRes, FTTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { TokenAmount } from '@/components/token';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnDirectionIcon, TxnStatusIcon } from '@/components/txn';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  ftCountPromise?: Promise<FTTxnCountRes>;
  ftsPromise?: Promise<FTTxnsRes>;
  loading?: boolean;
};

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
    header: 'Method',
    id: 'method',
  },
  {
    cell: (ft) => (
      <AccountLink
        account={
          ft.cause === 'BURN' ? ft.affected_account_id : ft.involved_account_id
        }
      />
    ),
    header: 'From',
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
    header: 'To',
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
    header: 'Quantity',
    id: 'quantity',
  },
  {
    cell: (ft) =>
      ft.block?.block_height ? (
        <Link className="text-link" href={`/blocks/${ft.block.block_height}`}>
          {numberFormat(ft.block.block_height)}
        </Link>
      ) : (
        <Skeleton className="w-20" />
      ),
    header: 'Block',
    id: 'block',
  },
  {
    cell: (ft) =>
      ft.block?.block_timestamp ? (
        <TimestampCell ns={ft.block.block_timestamp} />
      ) : (
        <Skeleton className="w-20" />
      ),
    cellClassName: 'px-1',
    className: 'w-40',
    header: <TimestampToggle />,
    id: 'age',
  },
];

export const TokenTransfers = ({
  ftCountPromise,
  ftsPromise,
  loading,
}: Props) => {
  const fts = !loading && ftsPromise ? use(ftsPromise) : null;
  const ftCount = !loading && ftCountPromise ? use(ftCountPromise) : null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={fts?.data}
          emptyMessage="No token transfers found"
          getRowKey={(ft) => `${ft.receipt_id}-${ft.event_index}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !ftCount}
            >
              {() => (
                <>{`A total of ${numberFormat(
                  ftCount?.data?.count ?? 0,
                )} token txns found`}</>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!fts?.errors}
          onPaginationNavigate={onPaginate}
          pagination={fts?.meta}
        />
      </CardContent>
    </Card>
  );
};
