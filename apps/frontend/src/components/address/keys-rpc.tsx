'use client';

import { Download } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountRpcKey,
  AccountRpcKeyCount,
  AccountRpcKeysRes,
} from 'nb-schemas';
import { ExportType } from 'nb-types';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { QuantumSafeBadge } from '@/components/quantum-safe-badge';
import { SkeletonSlot } from '@/components/skeleton';
import { FilterClearData, FilterData } from '@/components/table-filter';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { MethodBadge } from '@/components/txn';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { countFormat, isApproxCount, nearFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  keyCountPromise?: Promise<AccountRpcKeyCount | null>;
  keysPromise?: Promise<AccountRpcKeysRes>;
  loading?: boolean;
};

export const AccessKeysRpc = ({
  keyCountPromise,
  keysPromise,
  loading,
}: Props) => {
  const { t } = useLocale('address');
  const keys = !loading && keysPromise ? use(keysPromise) : null;
  if (keys?.errors?.length) throw new Error('Failed to load access keys');
  const keyCount = !loading && keyCountPromise ? use(keyCountPromise) : null;

  const columns: DataTableColumnDef<AccountRpcKey>[] = [
    {
      cell: (key) => (
        <div className="flex items-center gap-1">
          <QuantumSafeBadge publicKey={key.public_key} />
          <Truncate>
            <TruncateText className="max-w-50" text={key.public_key} />
            <TruncateCopy text={key.public_key} />
          </Truncate>
        </div>
      ),
      header: t('keys.columns.publicKey'),
      id: 'public_key',
    },
    {
      cell: (key) => (
        <MethodBadge text={key.permission_kind} textClassName="max-w-30" />
      ),
      header: t('keys.columns.access'),
      id: 'access',
      skeletonCell: <Skeleton className="h-4.5 w-16 rounded-md" />,
    },
    {
      cell: (key) =>
        key.permission?.receiverId ? (
          <AccountLink account={key.permission.receiverId} />
        ) : (
          ''
        ),
      header: t('keys.columns.contract'),
      id: 'contract',
    },
    {
      cell: (key) => {
        const permission = key.permission;
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
      header: t('keys.columns.allowance'),
      id: 'allowance',
    },
    {
      cell: (key) => {
        const permission = key.permission;
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
      header: t('keys.columns.methods'),
      id: 'methods',
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

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const params =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `/address/${address}/keys?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          actions={
            <Button asChild size="xs" variant="outline">
              <Link
                href={`/export-csv?account=${address}&type=${ExportType.KEYS}`}
              >
                <Download className="size-3" />
                {t('csvExport')}
              </Link>
            </Button>
          }
          columns={columns}
          data={keys?.data}
          emptyMessage={t('keys.empty')}
          getRowKey={(key) => key.public_key}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={!!loading}
            >
              {() => {
                const count = keyCount?.count ?? 0;
                return (
                  <>
                    {t(
                      isApproxCount(count) ? 'keys.total' : 'keys.totalExact',
                      { count: countFormat(count) },
                    )}
                  </>
                );
              }}
            </SkeletonSlot>
          }
          loading={!!loading}
          onClear={onClear}
          onFilter={onFilter}
          onPaginationNavigate={onPaginate}
          paginated={false}
          pagination={keys?.meta}
          skeletonRows={5}
        />
      </CardContent>
    </Card>
  );
};
