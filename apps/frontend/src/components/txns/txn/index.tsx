'use client';

import { RiQuestionLine } from '@remixicon/react';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

import { Stats, Txn, TxnFT, TxnNFT } from 'nb-schemas';

import { Copy } from '@/components/copy';
import { AccountLink, Link } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { LongDate } from '@/components/timestamp';
// import { TokenAmount, TokenImage } from '@/components/token';
import { TxnStatus } from '@/components/txn';
import { NearCircle } from '@/icons/near-circle';
import {
  gasFormat,
  nearFiatFormat,
  nearFormat,
  numberFormat,
} from '@/lib/format';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<null | Stats>;
  txnFTsPromise?: Promise<null | TxnFT[]>;
  txnNFTsPromise?: Promise<null | TxnNFT[]>;
  txnPromise?: Promise<null | Txn>;
};

export const Overview = ({
  loading,
  statsPromise,
  // txnFTsPromise,
  // txnNFTsPromise,
  txnPromise,
}: Props) => {
  const txn = !loading && txnPromise ? use(txnPromise) : null;
  // const fts = !loading && txnFTsPromise ? use(txnFTsPromise) : null;
  // const nfts = !loading && txnNFTsPromise ? use(txnNFTsPromise) : null;
  const stats = !loading && statsPromise ? use(statsPromise) : null;
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (txn && txn.outcomes.status == null) {
      interval = setInterval(() => router.refresh(), 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [txn, router]);

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
                <TooltipContent>
                  Unique identifier (hash) of this transaction
                </TooltipContent>
              </Tooltip>
              Txn Hash:
            </ListLeft>
            <ListRight className="xl:py-2.5">
              <p className="flex min-w-30 items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-40" />}
                  loading={loading || !txn}
                >
                  {() => (
                    <>
                      {txn!.transaction_hash}{' '}
                      <Copy
                        className="text-muted-foreground"
                        size="icon-xs"
                        text={txn!.transaction_hash || ''}
                      />
                    </>
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex h-13 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>The status of the transaction</TooltipContent>
              </Tooltip>
              Status:
            </ListLeft>
            <ListRight className="h-13">
              <SkeletonSlot
                fallback={<Skeleton className="h-6 w-20" />}
                loading={loading || !txn}
              >
                {() => <TxnStatus status={txn!.outcomes.status} />}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  The number of the block in which the transaction was recorded
                </TooltipContent>
              </Tooltip>
              Block Height:
            </ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-30" />}
                  loading={loading || !txn || !txn.block?.block_height}
                >
                  {() => (
                    <>
                      <Link
                        className="text-link"
                        href={`/blocks/${txn!.block.block_hash}`}
                      >
                        {numberFormat(txn!.block.block_height)}
                      </Link>
                      <Copy
                        className="text-muted-foreground"
                        size="icon-xs"
                        text={txn!.block.block_height || ''}
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
                  Date and time when transaction was processed
                </TooltipContent>
              </Tooltip>
              Timestamp:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-60" />}
                  loading={loading || !txn}
                >
                  {() => <LongDate ns={txn!.block_timestamp} />}
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
                  Shard ID where this transaction was executed
                </TooltipContent>
              </Tooltip>
              Shard Number:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-10" />}
                  loading={loading || !txn}
                >
                  {() => <>{txn!.shard_id}</>}
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
                  Account that signed and sent the transaction
                </TooltipContent>
              </Tooltip>
              From:
            </ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-30" />}
                  loading={loading || !txn}
                >
                  {() => (
                    <>
                      <AccountLink
                        account={txn!.signer_account_id}
                        textClassName="max-w-60"
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
                  Account that received this transaction
                </TooltipContent>
              </Tooltip>
              To:
            </ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-30" />}
                  loading={loading || !txn}
                >
                  {() => (
                    <>
                      <AccountLink
                        account={txn!.receiver_account_id}
                        textClassName="max-w-60"
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
                  Sum of all NEAR tokens transferred from the Signing account to
                  the Receiver account. This includes tokens sent in a Transfer
                  action(s), and as deposits on Function Call action(s)
                </TooltipContent>
              </Tooltip>
              Deposit Value:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-20" />}
                  loading={loading || !txn}
                >
                  {() => (
                    <span className="flex items-center gap-1">
                      <NearCircle className="size-4" />
                      {nearFormat(txn!.actions_agg.deposit)}{' '}
                      {stats?.near_price && (
                        <span className="text-muted-foreground">
                          (
                          {nearFiatFormat(
                            txn!.actions_agg.deposit,
                            stats.near_price,
                          )}
                          )
                        </span>
                      )}
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
                  Total fee paid in NEAR to execute this transaction
                </TooltipContent>
              </Tooltip>
              Transaction Fee:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-30" />}
                  loading={loading || !txn}
                >
                  {() => (
                    <span className="flex items-center gap-1">
                      <NearCircle className="size-4" />
                      {nearFormat(txn!.outcomes_agg.transaction_fee)}{' '}
                      {stats?.near_price && (
                        <span className="text-muted-foreground">
                          (
                          {nearFiatFormat(
                            txn!.outcomes_agg.transaction_fee,
                            stats.near_price,
                          )}
                          )
                        </span>
                      )}
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
                  Maximum amount of gas allocated for the transaction & the
                  amount eventually used
                </TooltipContent>
              </Tooltip>
              Gas Limit & Usage:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-30" />}
                  loading={loading || !txn}
                >
                  {() => (
                    <span className="flex items-center gap-1">
                      {gasFormat(txn!.actions_agg.gas_attached)} Tgas
                      <span className="text-muted-foreground">|</span>
                      {gasFormat(txn!.outcomes_agg.gas_used)} Tgas
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
                  Total amount of Gas & Token burnt from this transaction
                </TooltipContent>
              </Tooltip>
              Burnt Gas & Tokens:
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-30" />}
                  loading={loading || !txn}
                >
                  {() => (
                    <span className="flex items-center gap-1">
                      {gasFormat(txn!.receipt_conversion_gas_burnt)} Tgas
                      <span className="text-muted-foreground">|</span>
                      <NearCircle className="size-4" />
                      {nearFormat(txn!.receipt_conversion_tokens_burnt)}
                    </span>
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
