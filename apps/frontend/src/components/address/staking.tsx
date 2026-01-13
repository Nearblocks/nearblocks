'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountStakingTxn,
  AccountStakingTxnCount,
  AccountStakingTxnsRes,
} from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { Link } from '@/components/link';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnStatusIcon } from '@/components/txn-status';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';

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
  const stakings = !loading && stakingPromise ? use(stakingPromise) : null;
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
      cell: (staking) => (
        <Link className="text-link" href={`/txns/${staking.transaction_hash}`}>
          <Truncate>
            <TruncateText text={staking.transaction_hash ?? ''} />
            <TruncateCopy text={staking.transaction_hash ?? ''} />
          </Truncate>
        </Link>
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
      cell: (staking) => (
        <Link className="text-link" href={`/address/${staking.contract}`}>
          <Truncate>
            <TruncateText text={staking.contract} />
            <TruncateCopy text={staking.contract} />
          </Truncate>
        </Link>
      ),
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
      cell: (staking) => <TimestampCell ns={staking.block?.block_timestamp} />,
      className: 'w-42',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={stakings?.data}
      emptyMessage="No staking txns found"
      getRowKey={(staking) => `${staking.receipt_id}-${staking.index_in_chunk}`}
      header={
        <>{`A total of ${numberFormat(
          stakingCount?.count ?? 0,
        )} staking txns found`}</>
      }
      loading={loading || !stakingCount || !stakingCount?.count}
      onClear={onClear}
      onFilter={onFilter}
      onPaginationNavigate={(type, page) =>
        `/address/${address}/${tab}?${type}=${page}`
      }
      pagination={stakings?.meta}
    />
  );
};
