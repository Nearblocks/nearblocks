'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountFTTxn, AccountFTTxnCount, AccountFTTxnsRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { Link } from '@/components/link';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimeAgo } from '@/components/time-ago';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { TxnStatusIcon } from '@/components/txn-status';
import { numberFormat, toTokenAmount } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';

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
      className: 'w-[20px]',
      header: '',
      id: 'status',
    },
    {
      cell: (ft) => (
        <Link className="text-link" href={`/fts/${ft.receipt_id}`}>
          <Truncate>
            <TruncateText text={ft.transaction_hash ?? ''} />
            <TruncateCopy text={ft.transaction_hash ?? ''} />
          </Truncate>
        </Link>
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
      cell: (ft) =>
        numberFormat(toTokenAmount(ft.delta_amount, ft.meta?.decimals ?? 0)),
      header: 'Quantity',
      id: 'quantity',
    },
    {
      cell: (ft) => (
        <Link className="text-link" href={`/token/${ft.contract_account_id}`}>
          <Truncate>
            <TruncateText text={ft.contract_account_id} />
            <TruncateCopy text={ft.contract_account_id} />
          </Truncate>
        </Link>
      ),
      enableFilter: true,
      filterName: 'token',
      header: 'Token',
      id: 'token',
    },
    {
      cell: (ft) => <TimeAgo ns={ft.block?.block_timestamp} />,
      header: 'Age',
      id: 'age',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={fts?.data}
      emptyMessage="No token txns found"
      getRowKey={(ft) => `${ft.receipt_id}-${ft.event_index}`}
      header={
        <>{`A total of ${numberFormat(
          ftCount?.count ?? 0,
        )} token txns found`}</>
      }
      loading={loading || !ftCount || !ftCount?.count}
      onClear={onClear}
      onFilter={onFilter}
      onPaginationNavigate={(type, page) =>
        `/address/${address}/${tab}?${type}=${page}`
      }
      pagination={fts?.meta}
    />
  );
};
