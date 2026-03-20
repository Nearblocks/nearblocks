'use client';

import { use } from 'react';

import { NFTContractRes, NFTTokenRes } from 'nb-schemas';

import { ErrorSuspense } from '@/components/error-suspense';
import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TokenImage } from '@/components/token';
import { Truncate, TruncateText } from '@/components/truncate';
import { useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  cid: string;
  contractPromise?: Promise<NFTContractRes>;
  imageClassName?: string;
  loading?: boolean;
  textClassName?: string;
};

type NFTProps = {
  cid: string;
  contractPromise?: Promise<NFTContractRes>;
  loading?: boolean;
  tokenPromise?: Promise<NFTTokenRes>;
};

export const NftTokenHeader = ({
  cid,
  contractPromise,
  imageClassName,
  loading,
  textClassName,
}: Props) => {
  const contract = !loading && contractPromise ? use(contractPromise) : null;

  return (
    <SkeletonSlot
      fallback={
        <span className="flex items-center gap-2">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="w-32" />
        </span>
      }
      loading={loading || !contract}
    >
      {() => (
        <span className="flex items-center gap-2">
          <TokenImage
            alt={contract?.data?.name ?? cid}
            className={cn('size-6 rounded-full border', imageClassName)}
            src={contract?.data?.icon ?? ''}
          />
          <Truncate className="flex items-center gap-2">
            <TruncateText
              className={cn('text-foreground max-w-60', textClassName)}
              text={contract?.data?.name ?? cid}
            />
          </Truncate>
          <Truncate>
            (
            <TruncateText
              className={cn('text-foreground max-w-30', textClassName)}
              text={contract?.data?.symbol ?? cid}
            />
            )
          </Truncate>
        </span>
      )}
    </SkeletonSlot>
  );
};

export const NftHeader = ({
  cid,
  contractPromise,
  loading,
  tokenPromise,
}: NFTProps) => {
  const { t } = useLocale('nfts');
  const token = !loading && tokenPromise ? use(tokenPromise) : null;

  return (
    <>
      <h1 className="text-muted-foreground text-body-xl">
        <SkeletonSlot
          fallback={
            <span className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="w-32" />
            </span>
          }
          loading={loading || !token}
        >
          {() => (
            <Truncate className="flex items-center gap-2">
              {t('token.label')}{' '}
              <TruncateText
                className="text-foreground max-w-80"
                text={token?.data?.title ?? token?.data?.token ?? ''}
              />
            </Truncate>
          )}
        </SkeletonSlot>
      </h1>
      <Link
        className="text-body-base text-muted-foreground flex flex-wrap items-center gap-2"
        href={`/nft-tokens/${cid}`}
      >
        <ErrorSuspense fallback={<NftTokenHeader cid={cid} loading />}>
          <NftTokenHeader
            cid={cid}
            contractPromise={contractPromise}
            imageClassName="size-4"
            textClassName="text-link"
          />
        </ErrorSuspense>
      </Link>
    </>
  );
};
