'use client';

import { Inbox } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  AccountAssetNFT,
  AccountAssetNFTCount,
  AccountAssetNFTsRes,
} from 'nb-schemas';

import { EmptyBox } from '@/components/empty';
import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { NFTMedia, TokenImage } from '@/components/token';
import { Truncate, TruncateText } from '@/components/truncate';
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
  countPromise?: Promise<AccountAssetNFTCount | null>;
  loading?: boolean;
  nftsPromise?: Promise<AccountAssetNFTsRes>;
};

const SKELETON_COUNT = 24;

const NFTCard = ({ label, nft }: { label: string; nft: AccountAssetNFT }) => (
  <div className="flex flex-col gap-2">
    <Link href={`/nft-tokens/${nft.contract}/tokens/${nft.token}`}>
      <div className="aspect-square w-full overflow-hidden rounded-lg border">
        <NFTMedia
          alt={nft.token_meta?.title ?? nft.token}
          base={nft.meta?.base_uri}
          className="h-full w-full object-cover"
          media={nft.token_meta?.media}
          reference={nft.token_meta?.reference}
        />
      </div>
    </Link>
    <div className="text-body-xs space-y-0.5">
      <div className="truncate">
        <span className="text-muted-foreground">{label}</span>
        <Link
          className="text-link"
          href={`/nft-tokens/${nft.contract}/tokens/${encodeToken(nft.token)}`}
        >
          {nft.token}
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <TokenImage
          alt={nft.meta?.name ?? ''}
          className="m-px size-4 rounded-full border"
          src={nft.meta?.icon ?? ''}
        />
        <Link className="text-link" href={`/nft-tokens/${nft.contract}`}>
          <Truncate>
            <TruncateText
              className="max-w-30"
              text={nft.meta?.name ?? nft.contract}
            />
          </Truncate>
        </Link>
      </div>
    </div>
  </div>
);

export const NFTAssets = ({ countPromise, loading, nftsPromise }: Props) => {
  const { t } = useLocale('address');
  const nfts = !loading && nftsPromise ? use(nftsPromise) : null;
  const count = !loading && countPromise ? use(countPromise) : null;

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
      <div className="text-body-sm -mx-3 flex flex-wrap items-center justify-between gap-1 border-t border-b px-3 py-3">
        <SkeletonSlot
          fallback={
            <span className="leading-7">
              <Skeleton className="w-40" />
            </span>
          }
          loading={!!loading}
        >
          {() => {
            const value = count?.count ?? '0';
            return (
              <span className="leading-7">
                {t(
                  isApproxCount(value)
                    ? 'assets.nfts.total'
                    : 'assets.nfts.totalExact',
                  { count: countFormat(value) },
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
          ) : nfts?.data?.length ? (
            nfts.data.map((nft) => (
              <NFTCard
                key={`${nft.contract}-${nft.token}`}
                label={t('assets.nfts.token')}
                nft={nft}
              />
            ))
          ) : (
            <div className="col-span-full">
              <EmptyBox description={t('assets.nfts.empty')} icon={<Inbox />} />
            </div>
          )}
        </div>
      </div>
      {!loading && (nfts?.meta?.next_page || nfts?.meta?.prev_page) && (
        <div className="-mx-3 flex items-center border-t px-3 pt-3">
          <Pagination className="justify-end">
            <PaginationContent>
              {nfts.meta?.prev_page && (
                <PaginationItem>
                  <PaginationPrevious
                    href={onPaginate('prev', nfts.meta.prev_page)}
                    size="sm"
                  />
                </PaginationItem>
              )}
              {nfts.meta?.next_page && (
                <PaginationItem>
                  <PaginationNext
                    href={onPaginate('next', nfts.meta.next_page)}
                    size="sm"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
};
