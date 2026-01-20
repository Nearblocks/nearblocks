'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountKey, AccountKeyCount, AccountKeysRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { AccessKeyPermission } from '@/types/types';
import { Badge } from '@/ui/badge';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

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
      cell: (key) => {
        const txnHash =
          key.deleted.transaction_hash ?? key.created.transaction_hash;

        if (!txnHash) return <Skeleton className="w-30" />;

        return (
          <Link className="text-link" href={`/txns/${txnHash}`}>
            <Truncate>
              <TruncateText text={txnHash} />
              <TruncateCopy text={txnHash} />
            </Truncate>
          </Link>
        );
      },
      header: 'Txn Hash',
      id: 'txn_hash',
    },
    {
      cell: (key) => (
        <Truncate>
          <TruncateText text={key.public_key} />
          <TruncateCopy text={key.public_key} />
        </Truncate>
      ),
      header: 'Public Key',
      id: 'public_key',
    },
    {
      cell: (key) => (
        <Badge variant="teal">
          <Truncate>
            <TruncateText className="max-w-30" text={key.permission_kind} />
          </Truncate>
        </Badge>
      ),
      header: 'Access',
      id: 'access',
    },
    {
      cell: (key) => {
        const permission = key.permission as AccessKeyPermission | null;

        return permission?.receiverId ? (
          <Link
            className="text-link"
            href={`/address/${permission.receiverId}`}
          >
            <Truncate>
              <TruncateText text={permission.receiverId} />
              <TruncateCopy text={permission.receiverId} />
            </Truncate>
          </Link>
        ) : (
          ''
        );
      },
      header: 'Contract',
      id: 'contract',
    },
    {
      cell: (key) => {
        const permission = key.permission as AccessKeyPermission | null;
        return permission?.allowance ? (
          <span className="flex items-center gap-1">
            <NearCircle className="size-4" />
            {nearFormat(permission.allowance, {
              maximumFractionDigits: 4,
            })}
          </span>
        ) : permission?.receiverId ? (
          'Unlimited'
        ) : (
          ''
        );
      },
      className: 'w-25',
      header: 'Allowance',
      id: 'allowance',
    },
    {
      cell: (key) => {
        const permission = key.permission as AccessKeyPermission | null;
        const methods = permission?.methodNames ?? [];

        return methods.length > 0 ? (
          <Truncate>
            <TruncateText text={methods.join(', ')} />
          </Truncate>
        ) : permission?.receiverId ? (
          'All methods'
        ) : (
          ''
        );
      },
      className: 'w-35',
      header: 'Methods',
      id: 'methods',
    },
    {
      cell: (key) =>
        key.deleted.transaction_hash ? (
          <Badge variant="red">Deleted</Badge>
        ) : (
          <Badge variant="lime">Created</Badge>
        ),
      header: 'Action',
      id: 'action',
    },
    {
      cell: (key) => <TimestampCell ns={key.action_timestamp} />,
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
          loading={loading || !keyCount}
        >
          {() => (
            <>{`A total of ${numberFormat(
              keyCount?.count ?? 0,
            )} access keys found`}</>
          )}
        </SkeletonSlot>
      </CardHeader>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={keys?.data}
          emptyMessage="No access keys found"
          getRowKey={(key) => key.public_key}
          loading={loading || !!keys?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={(type, cursor) =>
            `/address/${address}/${tab}?${type}=${cursor}`
          }
          pagination={keys?.meta}
        />
      </CardContent>
    </Card>
  );
};
