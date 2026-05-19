'use client';

import { Box, Fuel } from 'lucide-react';
import { Fragment } from 'react';
import { use } from 'react';

import { BlockListItem } from 'nb-schemas';

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
      <ScrollArea className="h-78.5">
        <CardContent className="@container p-3">
          <SkeletonSlot
            fallback={
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Fragment key={i}>
                    <div className="flex flex-col gap-2 *:leading-tight @lg:flex-row @lg:items-center @lg:gap-3">
                      <div className="flex items-center justify-between gap-3 @lg:flex-1 @lg:justify-start">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="bg-muted shrink-0 rounded-lg p-2">
                            <Box className="size-5" />
                          </div>
                          <div className="text-body-sm flex flex-col">
                            <h4 className="text-link font-medium">
                              <Skeleton className="w-20" />
                            </h4>
                            <p className="text-body-2xs text-muted-foreground">
                              <Skeleton className="w-20" />
                            </p>
                          </div>
                        </div>
                        <Badge
                          className="text-body-xs h-6 shrink-0 @lg:hidden"
                          variant="teal"
                        >
                          <Fuel />
                          <Skeleton className="w-15" />
                        </Badge>
                      </div>
                      <div className="text-body-sm @lg:flex-1">
                        <h4 className="flex gap-1 font-normal whitespace-nowrap">
                          {t('blocks.author')} <Skeleton className="w-40" />
                        </h4>
                        <p className="text-body-2xs text-muted-foreground">
                          <Skeleton className="w-20" />
                        </p>
                      </div>
                      <Badge
                        className="text-body-xs hidden h-6 @lg:ml-auto @lg:inline-flex"
                        variant="teal"
                      >
                        <Fuel />
                        <Skeleton className="w-15" />
                      </Badge>
                    </div>
                    {i != 9 && <Separator className="my-2.5" />}
                  </Fragment>
                ))}
              </>
            }
            loading={loading || !blocks?.length}
          >
            {() => (
              <>
                {blocks?.map((block, i) => {
                  const tgas = `${gasFormat(block.chunks_agg.gas_used, {
                    maximumFractionDigits: 2,
                  })} Tgas`;
                  return (
                    <Fragment key={block.block_height}>
                      <div className="flex flex-col gap-2 *:leading-tight @lg:flex-row @lg:items-center @lg:gap-3">
                        <div className="flex items-center justify-between gap-3 @lg:flex-1 @lg:justify-start">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="bg-muted shrink-0 rounded-lg p-2">
                              <Box className="size-5" />
                            </div>
                            <div className="text-body-sm flex flex-col">
                              <h4 className="text-link font-medium">
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
                            className="text-body-xs h-6 shrink-0 @lg:hidden"
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
                              className="text-link inline-block w-40 truncate"
                              href={`/address/${block.author_account_id}`}
                            >
                              {block.author_account_id}
                            </Link>
                          </h4>
                          <p className="text-body-2xs text-muted-foreground">
                            {block.transactions_agg.count} {t('blocks.txns')}
                          </p>
                        </div>
                        <Badge
                          className="text-body-xs hidden h-6 @lg:ml-auto @lg:inline-flex"
                          variant="teal"
                        >
                          <Fuel />
                          {tgas}
                        </Badge>
                      </div>
                      {blocks.length != i + 1 && (
                        <Separator className="my-2.5" />
                      )}
                    </Fragment>
                  );
                })}
              </>
            )}
          </SkeletonSlot>
        </CardContent>
      </ScrollArea>
      <CardFooter className="border-t">
        <Button
          asChild
          className="text-headline-sm w-full"
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
