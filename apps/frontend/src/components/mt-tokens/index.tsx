'use client';

import { useSearchParams } from 'next/navigation';
import { use } from 'react';

import { MTList, MTListCountRes, MTListRes } from 'nb-schemas';

import { DataTable, DataTableColumnDef } from '@/components/data-table';
import { SkeletonSlot } from '@/components/skeleton';
import { MTTokenLink, TokenImage } from '@/components/token';
import { useLocale } from '@/hooks/use-locale';
import {
  countFormat,
  currencyFormat,
  isApproxCount,
  numberFormat,
} from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  mtListCountPromise?: Promise<MTListCountRes>;
  mtListPromise?: Promise<MTListRes>;
};

export const MtTokens = ({
  loading,
  mtListCountPromise,
  mtListPromise,
}: Props) => {
  const { t } = useLocale('mts');
  const searchParams = useSearchParams();
  const tokens = !loading && mtListPromise ? use(mtListPromise) : null;
  if (tokens?.errors?.length) throw new Error('Failed to load tokens');
  const tokenCount =
    !loading && mtListCountPromise ? use(mtListCountPromise) : null;

  const columns: DataTableColumnDef<MTList>[] = [
    {
      cell: (token) => (
        <span className="flex items-center gap-2">
          <TokenImage
            alt={token.name ?? token.contract}
            className="m-px size-5 rounded-full border"
            src={token.icon ?? ''}
          />
          <MTTokenLink
            contract={token.contract}
            decimals={token.decimals}
            name={token.name}
            symbol={token.symbol}
            token={token.token}
          />
        </span>
      ),
      cellClassName: 'px-4',
      className: 'w-60',
      enableSort: true,
      header: t('tokens.title'),
      id: 'token',
      sortName: 'name',
    },
    {
      cell: (token) =>
        token.price ? currencyFormat(token.price) : <span>N/A</span>,
      enableSort: true,
      header: t('tokens.price'),
      id: 'price',
      sortName: 'price',
    },
    {
      cell: (token) => numberFormat(token.holders),
      className: 'w-40',
      enableSort: true,
      header: t('tokens.holders'),
      id: 'holders',
      sortName: 'holders',
    },
    {
      cell: (token) => numberFormat(token.transfers),
      className: 'w-40',
      enableSort: true,
      header: t('tokens.transfers'),
      id: 'transfers',
      sortName: 'transfers',
    },
  ];

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const params =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `/mt-tokens?${params.toString()}`;
  };

  const onSort = (sort: string, order: 'asc' | 'desc') => {
    const params = buildParams(searchParams, {
      next: '',
      order,
      prev: '',
      sort,
    });
    return `/mt-tokens?${params.toString()}`;
  };

  return (
    <Card>
      <CardContent className="text-body-sm p-0">
        <DataTable
          columns={columns}
          data={tokens?.data}
          defaultSort="transfers"
          emptyMessage={t('tokens.empty')}
          getRowKey={(token) => `${token.contract}:${token.token}`}
          header={
            <SkeletonSlot
              fallback={<Skeleton className="w-40" />}
              loading={!!loading}
            >
              {() => {
                const count = tokenCount?.data?.count ?? 0;
                return (
                  <>
                    {t(
                      isApproxCount(count)
                        ? 'tokens.total'
                        : 'tokens.totalExact',
                      { count: countFormat(count) },
                    )}
                  </>
                );
              }}
            </SkeletonSlot>
          }
          loading={!!loading}
          onPaginationNavigate={onPaginate}
          onSortNavigate={onSort}
          pagination={tokens?.meta}
        />
      </CardContent>
    </Card>
  );
};
