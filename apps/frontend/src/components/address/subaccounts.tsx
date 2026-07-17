'use client';

import { Download } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountSubAccount,
  AccountSubAccountCount,
  AccountSubAccountsRes,
} from 'nb-schemas';
import { ExportType } from 'nb-types';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimestampCell, TimestampToggle } from '@/components/timestamp';
import { Truncate, TruncateCopy, TruncateText } from '@/components/truncate';
import { useLocale } from '@/hooks/use-locale';
import { countFormat, isApproxCount } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  subAccountCountPromise?: Promise<AccountSubAccountCount | null>;
  subAccountsPromise?: Promise<AccountSubAccountsRes>;
};

export const SubAccounts = ({
  loading,
  subAccountCountPromise,
  subAccountsPromise,
}: Props) => {
  const { t } = useLocale('address');
  const subAccounts =
    !loading && subAccountsPromise ? use(subAccountsPromise) : null;
  const subAccountCount =
    !loading && subAccountCountPromise ? use(subAccountCountPromise) : null;

  const columns: DataTableColumnDef<AccountSubAccount>[] = [
    {
      cell: (subAccount) => <AccountLink account={subAccount.account_id} />,
      header: t('subaccounts.columns.subaccount'),
      id: 'subaccount',
    },
    {
      cell: (subAccount) => {
        const txnHash =
          subAccount.deleted.transaction_hash ??
          subAccount.created.transaction_hash;

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
      header: t('subaccounts.columns.txnHash'),
      id: 'txn_hash',
    },
    {
      cell: (subAccount) =>
        subAccount.deleted.transaction_hash ? (
          <Badge variant="red">{t('subaccounts.deleted')}</Badge>
        ) : (
          <Badge variant="lime">{t('subaccounts.created')}</Badge>
        ),
      header: t('subaccounts.columns.action'),
      id: 'action',
    },
    {
      cell: (subAccount) => <TimestampCell ns={subAccount.action_timestamp} />,
      cellClassName: 'px-1',
      className: 'w-40',
      header: <TimestampToggle />,
      id: 'age',
    },
  ];

  const { address } = useParams<{ address: string }>();
  const searchParams = useSearchParams();

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const params =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `/address/${address}/subaccounts?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          actions={
            <Button asChild size="xs" variant="outline">
              <Link
                href={`/export-csv?account=${address}&type=${ExportType.SUBACCOUNTS}`}
              >
                <Download className="size-3" />
                {t('csvExport')}
              </Link>
            </Button>
          }
          columns={columns}
          data={subAccounts?.data}
          emptyMessage={t('subaccounts.empty')}
          getRowKey={(subAccount) => subAccount.account_id}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={loading || !subAccountCount}
            >
              {() => {
                const count = subAccountCount?.count ?? 0;
                return (
                  <>
                    {t(
                      isApproxCount(count)
                        ? 'subaccounts.total'
                        : 'subaccounts.totalExact',
                      { count: countFormat(count) },
                    )}
                  </>
                );
              }}
            </SkeletonSlot>
          }
          loading={loading || !!subAccounts?.errors}
          onPaginationNavigate={onPaginate}
          pagination={subAccounts?.meta}
        />
      </CardContent>
    </Card>
  );
};
