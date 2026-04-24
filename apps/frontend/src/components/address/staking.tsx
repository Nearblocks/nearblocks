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
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
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
  const { t } = useLocale('address');
  const staking = !loading && stakingPromise ? use(stakingPromise) : null;
  const stakingCount =
    !loading && stakingCountPromise ? use(stakingCountPromise) : null;

  const { address } = useParams<{ address: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const onFilter = (value: FilterData) => {
    const params = buildParams(searchParams, value);
    router.push(`/address/${address}/staking?${params.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const params = buildParams(searchParams, data);
    router.push(`/address/${address}/staking?${params.toString()}`);
  };

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `/address/${address}/staking?${params.toString()}`;
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
      header: t('staking.columns.txnHash'),
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
      filterPlaceholder: t('staking.filterMethod'),
      header: t('staking.columns.method'),
      id: 'type',
    },
    {
      cell: (staking) => <AccountLink account={staking.contract} />,
      enableFilter: true,
      filterName: 'contract',
      filterPlaceholder: t('staking.filterContract'),
      header: t('staking.columns.contract'),
      id: 'contract',
    },
    {
      cell: (staking) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4" />
          {nearFormat(staking.amount)}
        </span>
      ),
      header: t('staking.columns.amount'),
      id: 'amount',
    },
    {
      cell: (staking) =>
        staking.block?.block_timestamp ? (
          <TimestampCell ns={staking.block?.block_timestamp} />
        ) : (
          <Skeleton className="w-30" />
        ),
      cellClassName: 'px-1',
      className: 'w-40',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={staking?.data}
          emptyMessage={t('staking.empty')}
          getRowKey={(staking) =>
            `${staking.receipt_id}-${staking.index_in_chunk}`
          }
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !stakingCount}
            >
              {() => (
                <>
                  {t('staking.total', {
                    count: numberFormat(stakingCount?.count ?? 0),
                  })}
                </>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!staking?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={onPaginate}
          pagination={staking?.meta}
        />
      </CardContent>
    </Card>
  );
};
