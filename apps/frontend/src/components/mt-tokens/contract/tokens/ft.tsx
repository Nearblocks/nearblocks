'use client';

import { Inbox } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { MTTokenCountRes, MTTokenList, MTTokenListRes } from 'nb-schemas';

import { EmptyBox } from '@/components/empty';
import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage, TokenLink } from '@/components/token';
import { useLocale } from '@/hooks/use-locale';
import { countFormat, isApproxCount, numberFormat } from '@/lib/format';
import { buildParams, encodeToken } from '@/lib/utils';
import { Card } from '@/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/pagination';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  cid: string;
  loading?: boolean;
  tokenCountPromise?: Promise<MTTokenCountRes>;
  tokensPromise?: Promise<MTTokenListRes>;
};

const SKELETON_COUNT = 36;

const FTCard = ({ token }: { token: MTTokenList }) => (
  <Card className="p-3">
    <span className="flex items-center gap-1">
      <TokenImage
        alt={token.name ?? token.token}
        className="m-px size-5 rounded-full border"
        src={token?.media ?? token?.icon ?? ''}
      />
      <TokenLink
        contract={`${token.contract}/tokens/${encodeToken(token.token)}`}
        name={token.title ?? token.name}
        symbol={token.symbol}
        type="mt-tokens"
      />
    </span>
    <span className="text-muted-foreground p-1">
      {token.price
        ? `$${numberFormat(token.price, { maximumFractionDigits: 6 })}`
        : '-'}
    </span>
  </Card>
);

export const MtFtTokenList = ({
  loading,
  tokenCountPromise,
  tokensPromise,
}: Props) => {
  const { t } = useLocale('mts');
  const tokens = !loading && tokensPromise ? use(tokensPromise) : null;
  const tokenCount =
    !loading && tokenCountPromise ? use(tokenCountPromise) : null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onPaginate = (type: 'first' | 'next' | 'prev', cursor: string) => {
    const params =
      type === 'first'
        ? buildParams(searchParams, { next: '', prev: '' })
        : buildParams(searchParams, {
            [type]: cursor,
            [type === 'next' ? 'prev' : 'next']: '',
          });
    return `${pathname}?${params.toString()}`;
  };

  return (
    <>
      <div className="text-body-sm flex flex-wrap items-center justify-between gap-1 px-1 pb-3">
        <SkeletonSlot
          fallback={
            <span className="leading-7">
              <Skeleton className="w-40" />
            </span>
          }
          loading={!!loading}
        >
          {() => {
            const count = tokenCount?.data?.count ?? 0;
            return (
              <span className="leading-7">
                {t(
                  isApproxCount(count)
                    ? 'inventory.total'
                    : 'inventory.totalExact',
                  { count: countFormat(count) },
                )}
              </span>
            );
          }}
        </SkeletonSlot>
      </div>
      <div className="text-body-sm p-1">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <Card className="p-3" key={i}>
                <span className="flex items-center gap-1">
                  <Skeleton className="m-px size-5 rounded-full" />
                  <span className="block">
                    <Skeleton className="w-40" />
                  </span>
                </span>
                <span className="block p-1">
                  <Skeleton className="w-10" />
                </span>
              </Card>
            ))
          ) : tokens?.data?.length ? (
            tokens.data.map((token) => (
              <FTCard key={`${token.contract}-${token.token}`} token={token} />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyBox description={t('inventory.empty')} icon={<Inbox />} />
            </div>
          )}
        </div>
        {(loading || tokens?.meta?.next_page || tokens?.meta?.prev_page) && (
          <div className="mt-4 flex items-center border-t pt-3">
            {loading ? (
              <span className="flex w-full justify-end gap-1">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </span>
            ) : (
              <Pagination className="justify-end">
                <PaginationContent>
                  {tokens?.meta?.prev_page && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={onPaginate('prev', tokens.meta.prev_page)}
                        size="sm"
                      />
                    </PaginationItem>
                  )}
                  {tokens?.meta?.next_page && (
                    <PaginationItem>
                      <PaginationNext
                        href={onPaginate('next', tokens.meta.next_page)}
                        size="sm"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>
    </>
  );
};
