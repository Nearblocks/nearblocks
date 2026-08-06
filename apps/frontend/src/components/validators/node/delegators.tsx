'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import type { DataTableColumnDef } from '@/components/data-table';
import { DataTable } from '@/components/data-table';
import { AccountLink } from '@/components/link';
import { useLocale } from '@/hooks/use-locale';
import { useView } from '@/hooks/use-rpc';
import { useSettings } from '@/hooks/use-settings';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { Card } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

const PAGE_SIZE = 25;

type DelegatorAccount = {
  account_id: string;
  can_withdraw: boolean;
  staked_balance: string;
  unstaked_balance: string;
};

type Props = {
  node: string;
};

export const Delegators = ({ node }: Props) => {
  const { t } = useLocale('validators');
  const hydrated = useSettings((s) => s.hydrated);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const fromIndex = (page - 1) * PAGE_SIZE;

  const columns: DataTableColumnDef<DelegatorAccount>[] = [
    {
      cell: (row) => (
        <AccountLink
          account={row.account_id}
          textClassName="sm:max-w-60 md:max-w-100"
        />
      ),
      className: 'w-[50%]',
      header: t('nodeDetails.columns.account'),
      id: 'account',
    },
    {
      cell: (row) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4 shrink-0" />
          {nearFormat(row.staked_balance)}
        </span>
      ),
      header: t('nodeDetails.columns.stakedBalance'),
      id: 'staked_balance',
    },
    {
      cell: (row) => (
        <span className="flex items-center gap-1">
          <NearCircle className="size-4 shrink-0" />
          {nearFormat(row.unstaked_balance)}
        </span>
      ),
      header: t('nodeDetails.columns.unstakedBalance'),
      id: 'unstaked_balance',
    },
  ];

  const { data: totalData, isLoading: totalLoading } = useView<string>({
    args: {},
    contract: node,
    method: 'get_number_of_accounts',
  });

  const { data: delegatorsData, isLoading: delegatorsLoading } = useView<
    DelegatorAccount[]
  >({
    args: { from_index: fromIndex, limit: PAGE_SIZE },
    contract: node,
    method: 'get_accounts',
  });

  const total = totalData != null ? Number(totalData) : null;
  const hasNextPage = total != null && fromIndex + PAGE_SIZE < total;
  const hasPrevPage = page > 1;

  // useView's SWR key is null until the settings store hydrates, and SWR
  // reports isLoading=false for a null key — treat pre-hydration as loading
  // so SSR/first paint shows the skeleton instead of an empty table.
  const isDelegatorsLoading = delegatorsLoading || !hydrated;
  const isTotalLoading = totalLoading || !hydrated;

  return (
    <Card>
      <DataTable
        columns={columns}
        data={delegatorsData}
        getRowKey={(row) => row.account_id}
        header={
          isTotalLoading ? (
            <Skeleton className="w-32" />
          ) : total != null ? (
            t('nodeDetails.delegatorsTotal', { count: numberFormat(total) })
          ) : undefined
        }
        loading={isDelegatorsLoading}
        onPaginationNavigate={(type, cursor) =>
          type === 'first' ? pathname : `${pathname}?page=${cursor}`
        }
        pageParamKey="page"
        // Only reserve pager controls when a second page is plausible: keep
        // the reservation while the total is unknown, drop it once the pool
        // is known to fit one page.
        paginated={isTotalLoading || (total ?? 0) > PAGE_SIZE}
        pagination={
          isDelegatorsLoading
            ? null
            : {
                next_page: hasNextPage ? String(page + 1) : null,
                prev_page: hasPrevPage ? String(page - 1) : null,
              }
        }
        skeletonRows={PAGE_SIZE}
      />
    </Card>
  );
};
