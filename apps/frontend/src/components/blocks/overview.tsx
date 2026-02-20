'use client';

import { RiQuestionLine } from '@remixicon/react';
import { use } from 'react';

import { Block } from 'nb-schemas';

import { Copy } from '@/components/copy';
import { AccountLink, Link } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { LongDate } from '@/components/timestamp';
import { NearCircle } from '@/icons/near-circle';
import { gasFee, gasFormat, numberFormat } from '@/lib/format';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  blockPromise?: Promise<Block | null>;
  loading?: boolean;
};

export const Overview = ({ blockPromise, loading }: Props) => {
  const block = !loading && blockPromise ? use(blockPromise) : null;

  return (
    <Card>
      <CardContent className="px-3">
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="flex min-w-60 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>The block height of this block</TooltipContent>
              </Tooltip>
              Block Height:
            </ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-30" />}
                  loading={loading || !block}
                >
                  {() => (
                    <>
                      {numberFormat(block!.block_height)}{' '}
                      <Copy
                        className="text-muted-foreground"
                        size="icon-xs"
                        text={block!.block_height}
                      />
                    </>
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex min-w-60 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Unique identifier (hash) of this block
                </TooltipContent>
              </Tooltip>
              Hash:
            </ListLeft>
            <ListRight>
              <p className="flex min-w-30 items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-40" />}
                  loading={loading || !block}
                >
                  {() => (
                    <>
                      {block!.block_hash}{' '}
                      <Copy
                        className="text-muted-foreground"
                        size="icon-xs"
                        text={block!.block_hash}
                      />
                    </>
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Date and time when this block was produced
                </TooltipContent>
              </Tooltip>
              Timestamp:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-60" />}
                  loading={loading || !block}
                >
                  {() => <LongDate ns={block!.block_timestamp} />}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  The validator who produced this block
                </TooltipContent>
              </Tooltip>
              Author:
            </ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-30" />}
                  loading={loading || !block}
                >
                  {() => (
                    <AccountLink
                      account={block!.author_account_id}
                      textClassName="max-w-60"
                    />
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Number of transactions and receipts in this block
                </TooltipContent>
              </Tooltip>
              Transactions:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-20" />}
                  loading={loading || !block}
                >
                  {() => (
                    <>
                      <Badge asChild variant="teal">
                        <Link
                          className="text-link"
                          href={`/txns?block=${block!.block_hash}`}
                        >
                          {numberFormat(block!.transactions_agg.count)}{' '}
                          transactions
                        </Link>
                      </Badge>{' '}
                      and {numberFormat(block!.receipts_agg.count)} receipts
                    </>
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Total gas used by all chunks in this block
                </TooltipContent>
              </Tooltip>
              Gas Used:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-30" />}
                  loading={loading || !block}
                >
                  {() => (
                    <span>{gasFormat(block!.chunks_agg.gas_used)} Tgas</span>
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Total gas limit across all chunks in this block
                </TooltipContent>
              </Tooltip>
              Gas Limit:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-30" />}
                  loading={loading || !block}
                >
                  {() => (
                    <span>{gasFormat(block!.chunks_agg.gas_limit)} Tgas</span>
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Cost per unit of gas for this block
                </TooltipContent>
              </Tooltip>
              Gas Price:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-30" />}
                  loading={loading || !block}
                >
                  {() => (
                    <span className="flex items-center gap-1">
                      <NearCircle className="size-4" />
                      {gasFormat(block!.gas_price, {
                        maximumSignificantDigits: 4,
                      })}{' '}
                      / TGas
                    </span>
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Total gas fee for this block (gas used × gas price)
                </TooltipContent>
              </Tooltip>
              Gas Fee:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-30" />}
                  loading={loading || !block}
                >
                  {() => (
                    <span className="flex items-center gap-1">
                      <NearCircle className="size-4" />
                      {gasFee(block!.chunks_agg.gas_used, block!.gas_price)}
                    </span>
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Number of shards (chunks) in this block
                </TooltipContent>
              </Tooltip>
              Chunks:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-10" />}
                  loading={loading || !block}
                >
                  {() => <>{numberFormat(block!.chunks_agg.count)}</>}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>The hash of the previous block</TooltipContent>
              </Tooltip>
              Parent Hash:
            </ListLeft>
            <ListRight>
              <p className="flex min-w-30 items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-40" />}
                  loading={loading || !block}
                >
                  {() => (
                    <>
                      <Link
                        className="text-link"
                        href={`/blocks/${block!.prev_block_hash}`}
                      >
                        {block!.prev_block_hash}
                      </Link>
                      <Copy
                        className="text-muted-foreground"
                        size="icon-xs"
                        text={block!.prev_block_hash}
                      />
                    </>
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
