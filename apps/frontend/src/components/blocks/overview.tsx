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
      <CardContent className="px-0 py-2">
        {network !== 'mainnet' && (
          <>
            <p className="text-red-foreground text-body-2xs px-3 py-2">
              [{t('overview.testnetNotice')}]
            </p>
            <hr className="border-border" />
          </>
        )}
        <List pairsPerRow={1}>
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
                  fallback={
                    <span className="flex h-7 items-center">
                      <Skeleton className="w-25" />
                    </span>
                  }
                  loading={!!loading}
                >
                  {() =>
                    block ? (
                      <>
                        {numberFormat(block.block_height)}{' '}
                        <Copy
                          className="text-muted-foreground"
                          size="icon-xs"
                          text={block.block_height}
                        />
                      </>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
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
              <p className="min-w-30 break-all">
                <SkeletonSlot
                  fallback={
                    <span className="flex h-12 items-center min-[500px]:h-7">
                      <Skeleton className="w-70 max-w-full" />
                    </span>
                  }
                  loading={!!loading}
                >
                  {() =>
                    block ? (
                      <>
                        {block.block_hash}{' '}
                        <Copy
                          className="text-muted-foreground inline-flex align-middle"
                          size="icon-xs"
                          text={block.block_hash}
                        />
                      </>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
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
              <p className="flex items-center">
                <SkeletonSlot
                  fallback={
                    <span className="flex h-12 items-center min-[480px]:h-7">
                      <Skeleton className="w-60" />
                    </span>
                  }
                  loading={!!loading}
                >
                  {() =>
                    block ? (
                      <LongDate ns={block.block_timestamp} />
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
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
                  fallback={
                    <span className="flex h-7 items-center">
                      <Skeleton className="w-30" />
                    </span>
                  }
                  loading={!!loading}
                >
                  {() =>
                    block ? (
                      <AccountLink
                        account={block.author_account_id}
                        textClassName="max-w-60"
                      />
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
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
                  fallback={<Skeleton className="h-4.5 w-40 rounded-md" />}
                  loading={!!loading}
                >
                  {() =>
                    block ? (
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          asChild
                          className="text-body-xs px-1.5 py-0.5"
                          variant="teal"
                        >
                          <Link
                            className="text-link"
                            href={`/txns?block=${block.block_hash}`}
                          >
                            {t('overview.transactions', {
                              count: numberFormat(block.transactions_agg.count),
                            })}
                          </Link>
                        </Badge>
                        <span className="text-muted-foreground">and</span>
                        <Badge
                          asChild
                          className="text-body-xs px-1.5 py-0.5"
                          variant="teal"
                        >
                          <Link
                            className="text-link"
                            href={`/receipts?block=${block.block_hash}`}
                          >
                            {t('overview.receipts', {
                              count: numberFormat(block.receipts_agg.count),
                            })}
                          </Link>
                        </Badge>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
        </List>

        <hr className="border-border" />

        <List pairsPerRow={1}>
          <ListItem>
            <ListLeft className="flex min-w-60 items-center gap-1">
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
                  loading={!!loading}
                >
                  {() => {
                    if (!block) {
                      return <span className="text-muted-foreground">N/A</span>;
                    }
                    const used = Number(block.chunks_agg.gas_used);
                    const limit = Number(block.chunks_agg.gas_limit);
                    const utilization = limit > 0 ? (used / limit) * 100 : 0;
                    return (
                      <span className="flex flex-wrap items-center gap-2">
                        <span>{gasFormat(block.chunks_agg.gas_used)} Tgas</span>
                        <span className="text-muted-foreground text-body-sm">
                          ({utilization.toFixed(2)}%)
                        </span>
                      </span>
                    );
                  }}
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
                  loading={!!loading}
                >
                  {() =>
                    block ? (
                      <span>{gasFormat(block.chunks_agg.gas_limit)} Tgas</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
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
                  loading={!!loading}
                >
                  {() =>
                    block ? (
                      <span className="flex items-center gap-1">
                        <NearCircle className="size-4" />
                        {gasFormat(block.gas_price, {
                          maximumSignificantDigits: 4,
                        })}{' '}
                        / TGas
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
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
                  loading={!!loading}
                >
                  {() =>
                    block ? (
                      <span className="flex items-center gap-1">
                        <NearCircle className="size-4" />
                        {gasFee(block.chunks_agg.gas_used, block.gas_price)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
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
                  loading={!!loading}
                >
                  {() =>
                    block ? (
                      <>{numberFormat(block.chunks_agg.count)}</>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
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
              <p className="min-w-30 break-all">
                <SkeletonSlot
                  fallback={
                    <span className="flex h-12 items-center min-[500px]:h-7">
                      <Skeleton className="w-70 max-w-full" />
                    </span>
                  }
                  loading={!!loading}
                >
                  {() =>
                    block ? (
                      <>
                        <Link
                          className="text-link"
                          href={`/blocks/${block.prev_block_hash}`}
                        >
                          {block.prev_block_hash}
                        </Link>{' '}
                        <Copy
                          className="text-muted-foreground inline-flex align-middle"
                          size="icon-xs"
                          text={block.prev_block_hash}
                        />
                      </>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )
                  }
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
