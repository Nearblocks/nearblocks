'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountStakingTxn,
  AccountStakingTxnCount,
  AccountStakingTxnsRes,
} from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnStatusIcon } from '@/components/txn';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  stakingCountPromise?: Promise<AccountStakingTxnCount | null>;
  stakingPromise?: Promise<AccountStakingTxnsRes>;
};

export const StakingTxns = ({
  loading,
  stakingCountPromise,
  stakingPromise,
}: Props) => {
  const staking = !loading && stakingPromise ? use(stakingPromise) : null;
  const stakingCount =
    !loading && stakingCountPromise ? use(stakingCountPromise) : null;

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

  const columns: DataTableColumnDef<AccountStakingTxn>[] = [
    {
      cell: () => <TxnStatusIcon status />,
      className: 'w-5',
      header: '',
      id: 'status',
    },
    {
      cell: (staking) =>
        staking.transaction_hash ? (
          <Link
            className="text-link"
            href={`/txns/${staking.transaction_hash}`}
          >
            <Truncate>
              <TruncateText text={staking.transaction_hash} />
              <TruncateCopy text={staking.transaction_hash} />
            </Truncate>
          </Link>
        ) : (
          <Skeleton className="w-30" />
        ),
      header: 'Txn Hash',
      id: 'txn_hash',
    },
    {
      cell: (staking) => (
        <Badge variant="teal">
          <Truncate>
            <TruncateText className="max-w-20" text={staking.type} />
          </Truncate>
        </Badge>
      ),
      enableFilter: true,
      filterName: 'type',
      header: 'Method',
      id: 'type',
    },
    {
      cell: (staking) => <AccountLink account={staking.contract} />,
      enableFilter: true,
      filterName: 'contract',
      header: 'Contract',
      id: 'contract',
    },
    {
      cell: (staking) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(staking.amount)}
        </span>
      ),
      header: 'Amount',
      id: 'amount',
    },
    {
      cell: (staking) =>
        staking.block?.block_timestamp ? (
          <TimestampCell ns={staking.block?.block_timestamp} />
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
          loading={loading || !stakingCount}
        >
          {() => (
            <>{`A total of ${numberFormat(
              stakingCount?.count ?? 0,
            )} staking txns found`}</>
          )}
        </SkeletonSlot>
      </CardHeader>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={staking?.data}
          emptyMessage="No staking txns found"
          getRowKey={(staking) =>
            `${staking.receipt_id}-${staking.index_in_chunk}`
          }
          loading={loading || !!staking?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={(type, cursor) =>
            `/address/${address}/${tab}?${type}=${cursor}`
          }
          pagination={staking?.meta}
        />
      </CardContent>
    </Card>
  );
};
