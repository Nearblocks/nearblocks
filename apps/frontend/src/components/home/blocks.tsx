'use client';

import { Box, Fuel } from 'lucide-react';
import { Fragment } from 'react';
import { use } from 'react';

import { BlockListItem } from 'nb-schemas';

import { EmptyBox } from '@/components/empty';
import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimeAgo } from '@/components/time-ago';
import { useLocale } from '@/hooks/use-locale';
import { gasFormat, numberFormat } from '@/lib/format';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui/card';
import { ScrollArea } from '@/ui/scroll-area';
import { Separator } from '@/ui/separator';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  blocksPromise?: Promise<BlockListItem[] | null>;
  loading?: boolean;
};

export const Blocks = ({ blocksPromise, loading }: Props) => {
  const blocks = !loading && blocksPromise ? use(blocksPromise) : null;
  const { t } = useLocale('home');

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">{t('blocks.title')}</CardTitle>
      </CardHeader>
      <ScrollArea className="h-110 lg:h-78.5">
        <CardContent className="@container p-3">
          <SkeletonSlot
            fallback={
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Fragment key={i}>
                    <div className="flex flex-col gap-2 *:leading-tight @lg:flex-row @lg:items-center @lg:gap-3">
                      <div className="flex items-center justify-between gap-3 @lg:flex-1 @lg:justify-start">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="shrink-0 rounded-lg bg-muted p-2">
                            <Box className="size-6" />
                          </div>
                          <div className="flex flex-col text-body-sm leading-tight">
                            <h4 className="font-normal text-link">
                              <Skeleton className="w-20" />
                            </h4>
                            <p className="text-body-2xs text-muted-foreground">
                              <Skeleton className="w-20" />
                            </p>
                          </div>
                        </div>
                        <Badge
                          className="h-6 w-28 shrink-0 text-body-xs @lg:hidden"
                          variant="teal"
                        >
                          <Fuel />
                          <Skeleton className="w-15" />
                        </Badge>
                      </div>
                      <div className="text-body-sm @lg:flex-1">
                        <h4 className="flex gap-1 font-normal whitespace-nowrap">
                          {t('blocks.author')}{' '}
                          <span className="block">
                            <Skeleton className="w-40" />
                          </span>
                        </h4>
                        <p className="text-body-2xs text-muted-foreground">
                          <Skeleton className="w-20" />
                        </p>
                      </div>
                      <div className="hidden @lg:flex @lg:w-32 @lg:shrink-0 @lg:justify-end">
                        <Badge className="h-6 text-body-xs" variant="teal">
                          <Fuel />
                          <Skeleton className="w-15" />
                        </Badge>
                      </div>
                    </div>
                    {i != 9 && <Separator className="my-2.5" />}
                  </Fragment>
                ))}
              </>
            }
            loading={!!loading}
          >
            {() => {
              if (!blocks) throw new Error('Failed to load latest blocks');
              if (!blocks.length) {
                return (
                  <EmptyBox description="No blocks found" icon={<Box />} />
                );
              }
              return (
                <>
                  {blocks.map((block, i) => {
                    const tgas = `${gasFormat(block.chunks_agg.gas_used, {
                      maximumFractionDigits: 2,
                    })} Tgas`;
                    return (
                      <Fragment key={block.block_height}>
                        <div className="flex flex-col gap-2 *:leading-tight @lg:flex-row @lg:items-center @lg:gap-3">
                          <div className="flex items-center justify-between gap-3 @lg:flex-1 @lg:justify-start">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="shrink-0 rounded-lg bg-muted p-2">
                                <Box className="size-6" />
                              </div>
                              <div className="flex flex-col text-body-sm leading-tight">
                                <h4 className="font-normal text-link">
                                  <Link href={`/blocks/${block.block_height}`}>
                                    {numberFormat(block.block_height)}
                                  </Link>
                                </h4>
                                <p className="text-body-2xs text-muted-foreground">
                                  <TimeAgo ns={block.block_timestamp} />
                                </p>
                              </div>
                            </div>
                            <Badge
                              className="h-6 w-28 shrink-0 text-body-xs @lg:hidden"
                              variant="teal"
                            >
                              <Fuel />
                              {tgas}
                            </Badge>
                          </div>
                          <div className="text-body-sm @lg:flex-1">
                            <h4 className="flex gap-1 font-normal whitespace-nowrap">
                              {t('blocks.author')}{' '}
                              <Link
                                className="inline-block w-40 truncate text-link"
                                href={`/address/${block.author_account_id}`}
                              >
                                {block.author_account_id}
                              </Link>
                            </h4>
                            <p className="text-body-2xs text-muted-foreground">
                              {block.transactions_agg.count} {t('blocks.txns')}
                            </p>
                          </div>
                          <div className="hidden @lg:flex @lg:w-32 @lg:shrink-0 @lg:justify-end">
                            <Badge className="h-6 text-body-xs" variant="teal">
                              <Fuel />
                              {tgas}
                            </Badge>
                          </div>
                        </div>
                        {blocks.length != i + 1 && (
                          <Separator className="my-2.5" />
                        )}
                      </Fragment>
                    );
                  })}
                </>
              );
            }}
          </SkeletonSlot>
        </CardContent>
      </ScrollArea>
      <CardFooter className="border-t">
        <Button
          asChild
          className="w-full text-headline-sm"
          size="lg"
          variant="secondary"
        >
          <Link href="/blocks">
            {t('blocks.button')} <span aria-hidden="true">&rarr;</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
