'use client';

import { Fragment } from 'react';
import { use } from 'react';
import { LuArrowLeftRight } from 'react-icons/lu';

import { TxnsRes } from 'nb-schemas';

import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimeAgo } from '@/components/time-ago';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat } from '@/lib/format';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/ui/card';
import { ScrollArea } from '@/ui/scroll-area';
import { Separator } from '@/ui/separator';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  txnsPromise?: Promise<TxnsRes['data']>;
};

export const Txns = ({ loading, txnsPromise }: Props) => {
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  const { t } = useLocale('home');

  return (
    <Card>
      <CardHeader className="border-b py-5">
        <h2 className="text-headline-base">{t('txns.title')}</h2>
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
                        <LuArrowLeftRight className="size-6" />
                      </div>
                      <div className="text-headline-sm flex grow grid-cols-[2fr_2fr_1fr] flex-wrap gap-x-4 gap-y-2 @lg:grid @lg:items-center">
                        <div>
                          <h4 className="text-link">
                            <Skeleton className="w-40" />
                          </h4>
                          <p className="text-body-sm text-muted-foreground mt-0.5">
                            <Skeleton className="w-20" />
                          </p>
                        </div>
                        <div>
                          <h4 className="flex gap-1">
                            {t('txns.from')} <Skeleton className="w-40" />
                          </h4>
                          <h4 className="flex gap-1 pt-0.5">
                            {t('txns.to')} <Skeleton className="w-40" />
                          </h4>
                        </div>
                        <div className="@lg:ml-auto">
                          <Badge
                            className="text-headline-xs h-6"
                            variant="teal"
                          >
                            <NearCircle />
                            <Skeleton className="w-10" />
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {i != 9 && <Separator className="my-4" />}
                  </Fragment>
                ))}
              </>
            }
            loading={loading || !txns?.length}
          >
            {() => (
              <>
                {txns?.map((txn, i) => (
                  <Fragment key={txn.transaction_hash}>
                    <div className="flex items-center gap-4 *:leading-[160%]">
                      <div className="bg-muted rounded-lg p-3">
                        <LuArrowLeftRight className="size-6" />
                      </div>
                      <div className="text-headline-sm flex grow grid-cols-[2fr_2fr_1fr] flex-wrap gap-x-4 gap-y-2 @lg:grid @lg:items-center">
                        <div>
                          <h4 className="text-link flex">
                            <Link
                              className="inline-block w-40 truncate"
                              href={`/txns/${txn.transaction_hash}`}
                            >
                              {txn.transaction_hash}
                            </Link>
                          </h4>
                          <p className="text-body-sm text-muted-foreground mt-0.5">
                            <TimeAgo ns={txn.block?.block_timestamp} />
                          </p>
                        </div>
                        <div>
                          <h4 className="flex gap-1">
                            {t('txns.from')}{' '}
                            <Link
                              className="text-link inline-block w-40 truncate"
                              href={`/address/${txn.signer_account_id}`}
                            >
                              {txn.signer_account_id}
                            </Link>
                          </h4>
                          <h4 className="flex gap-1 pt-0.5">
                            {t('txns.to')}{' '}
                            <Link
                              className="text-link inline-block w-40 truncate"
                              href={`/address/${txn.receiver_account_id}`}
                            >
                              {txn.receiver_account_id}
                            </Link>
                          </h4>
                        </div>
                        <div className="@lg:ml-auto">
                          <Badge
                            className="text-headline-xs h-6"
                            variant="teal"
                          >
                            <NearCircle />
                            {nearFormat(txn.actions_agg.deposit, {
                              maximumFractionDigits: 2,
                              notation: 'compact',
                            })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {txns.length != i + 1 && <Separator className="my-4" />}
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
          <Link href="/txns">{t('txns.button')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
