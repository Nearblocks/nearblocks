import { RiQuestionLine } from '@remixicon/react';

import { TxnFT, TxnMT, TxnNFT } from 'nb-schemas';

import { ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
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
};

export const Transfers = ({ fts, loading, mts, nfts }: Props) => {
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
                <TooltipContent>
                  Fungible token transfers involving this transaction
                </TooltipContent>
              </Tooltip>
              Token Transfers:
              {!loading && fts && (
                <Badge className="ml-1 px-1.5 py-0.5 text-xs" variant="gray">
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
              {() => <FTTransfers fts={fts!} />}
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
                <TooltipContent>
                  Non-fungible token transfers involving this transaction
                </TooltipContent>
              </Tooltip>
              NFT Token Transfers:
              {!loading && nfts && (
                <Badge className="ml-1 px-1.5 py-0.5 text-xs" variant="gray">
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
              {() => <NFTTransfers nfts={nfts!} />}
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
                <TooltipContent>
                  Multi-token transfers involving this transaction
                </TooltipContent>
              </Tooltip>
              MT Token Transfers:
              {!loading && mts && (
                <Badge className="ml-1 px-1.5 py-0.5 text-xs" variant="gray">
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
              {() => <MTTransfers mts={mts!} />}
            </SkeletonSlot>
          </ListRight>
        </ListItem>
      )}
    </>
  );
};
