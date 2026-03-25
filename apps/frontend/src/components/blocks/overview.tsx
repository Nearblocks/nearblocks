'use client';

import { RiQuestionLine } from '@remixicon/react';
import { use } from 'react';

import { Block } from 'nb-schemas';

import { Copy } from '@/components/copy';
import { AccountLink, Link } from '@/components/link';
import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { LongDate } from '@/components/timestamp';
import { useConfig } from '@/hooks/use-config';
import { useLocale } from '@/hooks/use-locale';
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
  const { t } = useLocale('blocks');
  const network = useConfig((s) => s.config.network);
  const block = !loading && blockPromise ? use(blockPromise) : null;

  return (
    <Card>
      <CardContent className="px-3">
        <List pairsPerRow={1}>
          {network !== 'mainnet' && (
            <ListItem>
              <span className="text-red-foreground col-span-2 px-1 py-3">
                [{t('overview.testnetNotice')}]
              </span>
            </ListItem>
          )}
          <ListItem>
            <ListLeft className="flex min-w-60 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <RiQuestionLine className="size-4" />
                </TooltipTrigger>
                <TooltipContent>{t('tooltips.blockHeight')}</TooltipContent>
              </Tooltip>
              {t('overview.blockHeight')}
            </ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-25" />}
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
                <TooltipContent>{t('tooltips.hash')}</TooltipContent>
              </Tooltip>
              {t('overview.hash')}
            </ListLeft>
            <ListRight>
              <p className="flex min-w-30 items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-70" />}
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
                <TooltipContent>{t('tooltips.timestamp')}</TooltipContent>
              </Tooltip>
              {t('overview.timestamp')}
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
                <TooltipContent>{t('tooltips.author')}</TooltipContent>
              </Tooltip>
              {t('overview.author')}
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
                <TooltipContent>{t('tooltips.txns')}</TooltipContent>
              </Tooltip>
              {t('overview.txns')}
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-40" />}
                  loading={loading || !block}
                >
                  {() => (
                    <>
                      <Badge asChild variant="teal">
                        <Link
                          className="text-link"
                          href={`/txns?block=${block!.block_hash}`}
                        >
                          {t('overview.transactions', {
                            count: numberFormat(block!.transactions_agg.count),
                          })}
                        </Link>
                      </Badge>{' '}
                      {t('overview.receipts', {
                        count: numberFormat(block!.receipts_agg.count),
                      })}
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
                <TooltipContent>{t('tooltips.gasUsed')}</TooltipContent>
              </Tooltip>
              {t('overview.gasUsed')}
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-25" />}
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
                <TooltipContent>{t('tooltips.gasLimit')}</TooltipContent>
              </Tooltip>
              {t('overview.gasLimit')}
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-20" />}
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
                <TooltipContent>{t('tooltips.gasPrice')}</TooltipContent>
              </Tooltip>
              {t('overview.gasPrice')}
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
                <TooltipContent>{t('tooltips.gasFee')}</TooltipContent>
              </Tooltip>
              {t('overview.gasFee')}
            </ListLeft>
            <ListRight>
              <p>
                <SkeletonSlot
                  fallback={<Skeleton className="w-25" />}
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
                <TooltipContent>{t('tooltips.chunks')}</TooltipContent>
              </Tooltip>
              {t('overview.chunks')}
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
                <TooltipContent>{t('tooltips.parentHash')}</TooltipContent>
              </Tooltip>
              {t('overview.parentHash')}
            </ListLeft>
            <ListRight>
              <p className="flex min-w-30 items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="h-7 w-70" />}
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
