'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountKey, AccountKeyCount, AccountKeysRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { Link } from '@/components/link';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';

type Props = {
  keyCountPromise?: Promise<AccountKeyCount | null>;
  keysPromise?: Promise<AccountKeysRes>;
  loading?: boolean;
};

export const Keys = ({ keyCountPromise, keysPromise, loading }: Props) => {
  const keys = !loading && keysPromise ? use(keysPromise) : null;
  const keyCount = !loading && keyCountPromise ? use(keyCountPromise) : null;

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

  const columns: DataTableColumnDef<AccountKey>[] = [
    {
      cell: (key) => (
        <Link
          className="text-link"
          href={`/keys/${
            key.created.transaction_hash ?? key.deleted.transaction_hash
          }`}
        >
          <Truncate>
            <TruncateText
              text={
                key.created.transaction_hash ??
                key.deleted.transaction_hash ??
                ''
              }
            />
            <TruncateCopy
              text={
                key.created.transaction_hash ??
                key.deleted.transaction_hash ??
                ''
              }
            />
          </Truncate>
        </Link>
      ),
      header: 'Txn Hash',
      id: 'txn_hash',
    },
    {
      cell: (key) => (
        <Link className="text-link" href={`/keys/${key.public_key}`}>
          <Truncate>
            <TruncateText text={key.public_key} />
            <TruncateCopy text={key.public_key} />
          </Truncate>
        </Link>
      ),
      header: 'Public Key',
      id: 'public_key',
    },
    {
      cell: (key) => (
        <Badge variant="teal">
          <Truncate>
            <TruncateText className="max-w-20" text={key.permission_kind} />
          </Truncate>
        </Badge>
      ),
      header: 'Access',
      id: 'access',
    },
    {
      cell: (key) => <TimestampCell ns={key.action_timestamp} />,
      className: 'w-42',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={keys?.data}
      emptyMessage="No access keys found"
      getRowKey={(key) => key.public_key}
      header={
        <>{`A total of ${numberFormat(
          keyCount?.count ?? 0,
        )} access keys found`}</>
      }
      loading={loading || !keyCount || !keyCount?.count}
      onClear={onClear}
      onFilter={onFilter}
      onPaginationNavigate={(type, page) =>
        `/address/${address}/${tab}?${type}=${page}`
      }
      pagination={keys?.meta}
    />
  );
};
