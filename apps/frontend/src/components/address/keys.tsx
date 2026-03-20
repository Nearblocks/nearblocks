'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { AccountKey, AccountKeyCount, AccountKeysRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat, numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { AccessKeyPermission } from '@/types/types';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  keyCountPromise?: Promise<AccountKeyCount | null>;
  keysPromise?: Promise<AccountKeysRes>;
  loading?: boolean;
};

export const AccessKeys = ({
  keyCountPromise,
  keysPromise,
  loading,
}: Props) => {
  const { t } = useLocale('address');
  const keys = !loading && keysPromise ? use(keysPromise) : null;
  const keyCount = !loading && keyCountPromise ? use(keyCountPromise) : null;

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
      header: t('keys.columns.txnHash'),
      id: 'txn_hash',
    },
    {
      cell: (key) => (
        <Truncate>
          <TruncateText text={key.public_key} />
          <TruncateCopy text={key.public_key} />
        </Truncate>
      ),
      header: t('keys.columns.publicKey'),
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
      header: t('keys.columns.access'),
      id: 'access',
    },
    {
      cell: (key) => {
        const permission = key.permission as AccessKeyPermission | null;

        return permission?.receiverId ? (
          <AccountLink account={permission.receiverId} />
        ) : (
          ''
        );
      },
      header: t('keys.columns.contract'),
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
          t('keys.unlimited')
        ) : (
          ''
        );
      },
      className: 'w-25',
      header: t('keys.columns.allowance'),
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
          t('keys.allMethods')
        ) : (
          ''
        );
      },
      className: 'w-35',
      header: t('keys.columns.methods'),
      id: 'methods',
    },
    {
      cell: (key) =>
        key.deleted.transaction_hash ? (
          <Badge variant="red">{t('keys.deleted')}</Badge>
        ) : (
          <Badge variant="lime">{t('keys.created')}</Badge>
        ),
      header: t('keys.columns.action'),
      id: 'action',
    },
    {
      cell: (key) => <TimestampCell ns={key.action_timestamp} />,
      cellClassName: 'px-1',
      className: 'w-40',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const { address } = useParams<{ address: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const onFilter = (value: FilterData) => {
    const params = buildParams(searchParams, value);
    router.push(`/address/${address}/keys?${params.toString()}`);
  };

  const onClear = (data: FilterClearData) => {
    const params = buildParams(searchParams, data);
    router.push(`/address/${address}/keys?${params.toString()}`);
  };

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `/address/${address}/keys?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={keys?.data}
          emptyMessage={t('keys.empty')}
          getRowKey={(key) => key.public_key}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !keyCount}
            >
              {() => (
                <>
                  {t('keys.total', {
                    count: numberFormat(keyCount?.count ?? 0),
                  })}
                </>
              )}
            </SkeletonSlot>
          }
          loading={loading || !!keys?.errors}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={onPaginate}
          pagination={keys?.meta}
        />
      </CardContent>
    </Card>
  );
};
