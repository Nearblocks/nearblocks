'use client';

import { Inbox } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { use } from 'react';

import {
  NFTContractRes,
  NFTTokenCountRes,
  NFTTokenList,
  NFTTokenListRes,
} from 'nb-schemas';

import { EmptyBox } from '@/components/empty';
import { AccountLink, Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { NFTMedia } from '@/components/token';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { buildParams } from '@/lib/utils';
import { Card, CardContent } from '@/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/pagination';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  contractPromise?: Promise<NFTContractRes>;
  loading?: boolean;
  tokenCountPromise?: Promise<NFTTokenCountRes>;
  tokensPromise?: Promise<NFTTokenListRes>;
};

const SKELETON_COUNT = 24;

const TokenCard = ({
  baseUri,
  contract,
  ownerLabel,
  titleLabel,
  token,
}: {
  baseUri: null | string;
  contract: string;
  ownerLabel: string;
  titleLabel: string;
  token: NFTTokenList;
}) => (
  <div className="flex flex-col gap-2">
    <Link href={`/nft-tokens/${contract}/tokens/${token.token}`}>
      <div className="aspect-square w-full overflow-hidden rounded-lg border">
        <NFTMedia
          alt={token.title ?? token.token}
          base={baseUri}
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
          href={`/nft-tokens/${contract}/tokens/${token.token}`}
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

export const NftTokens = ({
  contractPromise,
  loading,
  tokenCountPromise,
  tokensPromise,
}: Props) => {
  const { t } = useLocale('nfts');
  const tokens = !loading && tokensPromise ? use(tokensPromise) : null;
  const tokenCount =
    !loading && tokenCountPromise ? use(tokenCountPromise) : null;
  const contractRes = !loading && contractPromise ? use(contractPromise) : null;
  const contract = contractRes?.data ?? null;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onPaginate = (type: 'next' | 'prev', cursor: string) => {
    const params = buildParams(searchParams, {
      [type]: cursor,
      [type === 'next' ? 'prev' : 'next']: '',
    });
    return `${pathname}?${params.toString()}`;
  };

  const contractId = contract?.contract ?? '';

  return (
    <Card>
      <div className="text-body-sm flex flex-wrap items-center justify-between gap-1 border-b px-4 py-3">
        <SkeletonSlot
          fallback={<Skeleton className="h-7 w-40" />}
          loading={loading || !tokenCount}
        >
          {() => (
            <span className="leading-7">
              {t('inventory.total', {
                count: numberFormat(tokenCount?.data?.count ?? 0),
              })}
            </span>
          )}
        </SkeletonSlot>
      </div>
      <CardContent className="text-body-sm p-4">
        <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {loading || !tokens ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div className="flex flex-col gap-2" key={i}>
                <Skeleton className="aspect-square w-full rounded-lg" />
                <div className="h-12.5">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              </div>
            ))
          ) : tokens.data?.length ? (
            tokens.data.map((token) => (
              <TokenCard
                baseUri={contract?.base_uri ?? null}
                contract={contractId}
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
        {!loading && (tokens?.meta?.next_page || tokens?.meta?.prev_page) && (
          <div className="mt-4 flex items-center border-t pt-3">
            <Pagination className="justify-end">
              <PaginationContent>
                {tokens.meta?.prev_page && (
                  <PaginationItem>
                    <PaginationPrevious
                      href={onPaginate('prev', tokens.meta.prev_page)}
                      size="sm"
                    />
                  </PaginationItem>
                )}
                {tokens.meta?.next_page && (
                  <PaginationItem>
                    <PaginationNext
                      href={onPaginate('next', tokens.meta.next_page)}
                      size="sm"
                    />
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
