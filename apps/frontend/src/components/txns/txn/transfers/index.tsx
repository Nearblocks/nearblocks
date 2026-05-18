'use client';

import { RiQuestionLine } from '@remixicon/react';

import { TxnFT, TxnMT, TxnNFT } from 'nb-schemas';

import { ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { Badge } from '@/ui/badge';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

import { FTTransfers } from './ft';
import { MTTransfers } from './mt';
import { NFTTransfers } from './nft';

type Props = {
  fts: null | TxnFT[];
  loading?: boolean;
  mts: null | TxnMT[];
  nfts: null | TxnNFT[];
  spamPatterns?: string[];
};

export const Transfers = ({ fts, loading, mts, nfts, spamPatterns }: Props) => {
  const { t } = useLocale('txns');

  const mtFtCount =
    mts?.filter(
      (mt) =>
        mt.base_meta?.decimals != null &&
        (BigInt(mt.delta_amount) > 0n || mt.involved_account_id === null),
    ).length ?? 0;

  const mtNftCount =
    mts?.filter(
      (mt) =>
        mt.base_meta?.decimals == null &&
        (BigInt(mt.delta_amount) > 0n || mt.involved_account_id === null),
    ).length ?? 0;

  return (
    <>
      {(loading || (fts && fts.length > 0)) && (
        <ListItem>
          <ListLeft>
            <p className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>{t('transfers.ftTip')}</TooltipContent>
              </Tooltip>
              {t('transfers.ftTitle')}
              {!loading && fts && (
                <Badge className="ml-1 h-4 px-1 text-[10px]" variant="gray">
                  {
                    fts.filter(
                      (ft) =>
                        BigInt(ft.delta_amount) > 0n ||
                        ft.involved_account_id === null,
                    ).length
                  }
                </Badge>
              )}
            </p>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={<Skeleton className="h-19 w-full" />}
              loading={!!(loading || !fts)}
            >
              {() => <FTTransfers fts={fts!} spamPatterns={spamPatterns} />}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
      )}
      {(loading || (nfts && nfts.length > 0)) && (
        <ListItem>
          <ListLeft>
            <p className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>{t('transfers.nftTip')}</TooltipContent>
              </Tooltip>
              {t('transfers.nftTitle')}
              {!loading && nfts && (
                <Badge className="ml-1 h-4 px-1 text-[10px]" variant="gray">
                  {
                    nfts.filter(
                      (nft) =>
                        nft.delta_amount > 0 ||
                        nft.involved_account_id === null,
                    ).length
                  }
                </Badge>
              )}
            </p>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={<Skeleton className="h-13 w-full" />}
              loading={!!(loading || !nfts)}
            >
              {() => <NFTTransfers nfts={nfts!} spamPatterns={spamPatterns} />}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
      )}
      {(loading || (mts && mts.length > 0)) && (
        <ListItem>
          <ListLeft>
            <p className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>{t('transfers.mtTip')}</TooltipContent>
              </Tooltip>
              {t('transfers.mtTitle')}
              {!loading && mts && (
                <Badge className="ml-1 h-4 px-1 text-[10px]" variant="gray">
                  {mtFtCount + mtNftCount}
                </Badge>
              )}
            </p>
          </ListLeft>
          <ListRight>
            <SkeletonSlot
              fallback={<Skeleton className="h-19 w-full" />}
              loading={!!(loading || !mts)}
            >
              {() => <MTTransfers mts={mts!} spamPatterns={spamPatterns} />}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
      )}
    </>
  );
};
