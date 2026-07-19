'use client';

import { Inbox } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import { MTTokenCountRes, MTTokenList, MTTokenListRes } from 'nb-schemas';

import { EmptyBox } from '@/components/empty';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { NFTMedia } from '@/components/token';
import { useLocale } from '@/hooks/use-locale';
import { countFormat, isApproxCount } from '@/lib/format';
import { buildParams, encodeToken } from '@/lib/utils';
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

const SKELETON_COUNT = 24;

const NftCard = ({
  cid,
  ownerLabel,
  titleLabel,
  token,
}: {
  cid: string;
  ownerLabel: string;
  titleLabel: string;
  token: MTTokenList;
}) => (
  <div className="flex flex-col gap-2">
    <Link href={`/mt-tokens/${cid}/nft-tokens/${encodeToken(token.token)}`}>
      <div className="aspect-square w-full overflow-hidden rounded-lg border">
        <NFTMedia
          alt={token.title ?? token.token}
          base={token.base_uri}
          className="h-full w-full object-cover"
          media={token.media}
          reference={token.reference}
        />
      </div>
    </Link>
    <div className="text-body-xs space-y-0.5">
      <div>
        <span className="text-muted-foreground">{titleLabel}</span>
        <Link
          className="text-link"
          href={`/mt-tokens/${cid}/nft-tokens/${encodeToken(token.token)}`}
        >
          {token.token}
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">{ownerLabel}</span>
        <AccountLink account={token.owner} />
      </div>
    </div>
  </div>
);

export const MtNftTokenList = ({
  cid,
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
      <div className="text-body-sm -mx-3 flex flex-wrap items-center justify-between gap-1 border-t border-b px-4 py-3">
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
      <div className="text-body-sm px-1 py-4">
        <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {loading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div className="flex flex-col gap-2" key={i}>
                <Skeleton className="aspect-square h-auto w-full rounded-lg" />
                <div className="text-body-xs space-y-0.5">
                  <span className="block">
                    <Skeleton className="w-1/2" />
                  </span>
                  <span className="block">
                    <Skeleton className="w-3/4" />
                  </span>
                </div>
              </div>
            ))
          ) : tokens?.data?.length ? (
            tokens.data.map((token) => (
              <NftCard
                cid={cid}
                key={`${token.contract}-${token.token}`}
                ownerLabel={t('inventory.owner')}
                titleLabel={t('inventory.title')}
                token={token}
              />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyBox description={t('inventory.empty')} icon={<Inbox />} />
            </div>
          )}
        </div>
      </div>
      {(loading || tokens?.meta?.next_page || tokens?.meta?.prev_page) && (
        <div className="-mx-3 flex items-center border-t px-3 pt-3">
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
    </>
  );
};
