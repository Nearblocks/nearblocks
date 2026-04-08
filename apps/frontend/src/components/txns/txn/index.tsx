'use client';

import { RiQuestionLine } from '@remixicon/react';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

import { Stats, Txn, TxnFT, TxnMT, TxnNFT, TxnReceipt } from 'nb-schemas';

import { Copy } from '@/components/copy';
import { AccountLink, Link } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { LongDate } from '@/components/timestamp';
import { TxnReceiptErrors, TxnStatus } from '@/components/txn';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
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

import { Transfers } from './transfers';

type Props = {
  loading?: boolean;
  receiptsPromise?: Promise<null | TxnReceipt>;
  statsPromise?: Promise<null | Stats>;
  txnFTsPromise?: Promise<null | TxnFT[]>;
  txnMTsPromise?: Promise<null | TxnMT[]>;
  txnNFTsPromise?: Promise<null | TxnNFT[]>;
  txnPromise?: Promise<null | Txn>;
};

export const Overview = ({
  loading,
  receiptsPromise,
  statsPromise,
  txnFTsPromise,
  txnMTsPromise,
  txnNFTsPromise,
  txnPromise,
}: Props) => {
  const { t } = useLocale('txns');
  const network = useConfig((s) => s.config.network);
  const txn = !loading && txnPromise ? use(txnPromise) : null;
  const fts = !loading && txnFTsPromise ? use(txnFTsPromise) : null;
  const mts = !loading && txnMTsPromise ? use(txnMTsPromise) : null;
  const nfts = !loading && txnNFTsPromise ? use(txnNFTsPromise) : null;
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;
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
      <CardContent className="px-3 py-3">
        {network !== 'mainnet' && (
          <p className="text-red-foreground px-1 py-3">
            [{t('overview.testnetNotice')}]
          </p>
        )}
        {/* Section 1: Core transaction info */}
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="flex min-w-60 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>{t('overview.txnHashTip')}</TooltipContent>
              </Tooltip>
              {t('overview.txnHash')}
            </ListLeft>
            <ListRight>
              <p className="flex min-w-30 items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-60" />}
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
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>{t('overview.statusTip')}</TooltipContent>
              </Tooltip>
              {t('overview.status')}
            </ListLeft>
            <ListRight>
              <SkeletonSlot
                fallback={<Skeleton className="h-6 w-20" />}
                loading={loading || !txn}
              >
                {() => (
                  <div className="flex flex-wrap items-center gap-2">
                    <TxnStatus status={txn!.outcomes.status} />
                    <TxnReceiptErrors receipts={receipts} />
                  </div>
                )}
              </SkeletonSlot>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>{t('overview.blockHeightTip')}</TooltipContent>
              </Tooltip>
              {t('overview.blockHeight')}
            </ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-25" />}
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
                <TooltipContent>{t('overview.timestampTip')}</TooltipContent>
              </Tooltip>
              {t('overview.timestamp')}
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
                <TooltipContent>{t('overview.shardNumberTip')}</TooltipContent>
              </Tooltip>
              {t('overview.shardNumber')}
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
        </List>

        <hr className="border-border my-2" />

        {/* Section 2: Addresses & transfers */}
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="flex min-w-60 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>{t('overview.fromTip')}</TooltipContent>
              </Tooltip>
              {t('overview.from')}
            </ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-30" />}
                  loading={loading || !txn}
                >
                  {() => (
                    <AccountLink
                      account={txn!.signer_account_id}
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
                <TooltipContent>{t('overview.toTip')}</TooltipContent>
              </Tooltip>
              {t('overview.to')}
            </ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-30" />}
                  loading={loading || !txn}
                >
                  {() => (
                    <AccountLink
                      account={txn!.receiver_account_id}
                      textClassName="max-w-60"
                    />
                  )}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <Transfers fts={fts} loading={loading} mts={mts} nfts={nfts} />
        </List>

        <hr className="border-border my-2" />

        {/* Section 3: Fees & gas */}
        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="flex min-w-60 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>{t('overview.depositTip')}</TooltipContent>
              </Tooltip>
              {t('overview.deposit')}
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
                <TooltipContent>{t('overview.feeTip')}</TooltipContent>
              </Tooltip>
              {t('overview.fee')}
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-25" />}
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
                <TooltipContent>{t('overview.gasLimitTip')}</TooltipContent>
              </Tooltip>
              {t('overview.gasLimit')}
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
                <TooltipContent>{t('overview.burntGasTip')}</TooltipContent>
              </Tooltip>
              {t('overview.burntGas')}
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
