'use client';

import { Fragment } from 'react';
import { use } from 'react';
import { LuBox, LuFuel } from 'react-icons/lu';

import { BlocksRes } from 'nb-schemas';

import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimeAgo } from '@/components/time-ago';
import { useLocale } from '@/hooks/use-locale';
import { gasFormat, numberFormat } from '@/lib/format';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/ui/card';
import { ScrollArea } from '@/ui/scroll-area';
import { Separator } from '@/ui/separator';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  blocksPromise?: Promise<BlocksRes['data']>;
  loading?: boolean;
};

export const Blocks = ({ blocksPromise, loading }: Props) => {
  const blocks = !loading && blocksPromise ? use(blocksPromise) : null;
  const { t } = useLocale('home');

  return (
    <Card>
      <CardHeader className="border-b py-5">
        <h2 className="text-headline-base">{t('blocks.title')}</h2>
      </CardHeader>
      <ScrollArea className="h-101">
        <CardContent className="@container p-4">
          <SkeletonSlot
            fallback={
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Fragment key={i}>
                    <div className="flex items-center gap-4 *:leading-[160%]">
                      <div className="bg-muted rounded-lg p-3">
                        <LuBox className="size-6" />
                      </div>
                      <div className="text-headline-sm flex grow grid-cols-[1.5fr_2fr_1fr] flex-col flex-wrap gap-x-4 gap-y-2 @lg:grid @lg:items-center">
                        <div>
                          <h4 className="text-link">
                            <Skeleton className="w-20" />
                          </h4>
                          <p className="text-body-sm text-muted-foreground mt-0.5">
                            <Skeleton className="w-20" />
                          </p>
                        </div>
                        <div>
                          <h4 className="flex gap-1">
                            {t('blocks.author')} <Skeleton className="w-40" />
                          </h4>
                          <p className="text-body-sm text-muted-foreground mt-0.5">
                            <Skeleton className="w-20" />
                          </p>
                        </div>
                        <div className="@lg:ml-auto">
                          <Badge
                            className="text-headline-xs h-6"
                            variant="amber"
                          >
                            <LuFuel />
                            <Skeleton className="w-15" />
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {i != 9 && <Separator className="my-4" />}
                  </Fragment>
                ))}
              </>
            }
            loading={loading || !blocks?.length}
          >
            {() => (
              <>
                {blocks?.map((block, i) => (
                  <Fragment key={block.block_height}>
                    <div className="flex items-center gap-4 *:leading-[160%]">
                      <div className="bg-muted rounded-lg p-3">
                        <LuBox className="size-6" />
                      </div>
                      <div className="text-headline-sm flex grow grid-cols-[1.5fr_2fr_1fr] flex-wrap gap-x-4 gap-y-2 @lg:grid @lg:items-center">
                        <div>
                          <h4 className="text-link">
                            <Link href={`/blocks/${block.block_height}`}>
                              {numberFormat(block.block_height)}
                            </Link>
                          </h4>
                          <p className="text-body-sm text-muted-foreground mt-0.5">
                            <TimeAgo ns={block.block_timestamp} />
                          </p>
                        </div>
                        <div>
                          <h4 className="flex gap-1">
                            {t('blocks.author')}{' '}
                            <Link
                              className="text-link inline-block w-40 truncate"
                              href={`/address/${block.author_account_id}`}
                            >
                              {block.author_account_id}
                            </Link>
                          </h4>
                          <p className="text-body-sm text-muted-foreground mt-0.5">
                            {block.transactions_agg.count} txns
                          </p>
                        </div>
                        <div className="@lg:ml-auto">
                          <Badge
                            className="text-headline-xs h-6"
                            variant="amber"
                          >
                            <LuFuel />
                            {gasFormat(block.chunks_agg.gas_used, {
                              maximumFractionDigits: 2,
                            })}{' '}
                            Tgas
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {blocks.length != i + 1 && <Separator className="my-4" />}
                  </Fragment>
                ))}
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
          <Link href="/blocks">{t('blocks.button')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
