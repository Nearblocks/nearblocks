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
      <CardHeader className="border-b py-3">
        <h2 className="text-headline-sm font-semibold">{t('txns.title')}</h2>
      </CardHeader>
      <ScrollArea className="h-[340px]">
        <CardContent className="@container p-3">
          <SkeletonSlot
            fallback={
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Fragment key={i}>
                    <div className="flex items-center gap-3 *:leading-[140%]">
                      <div className="bg-muted rounded-lg p-2">
                        <LuArrowLeftRight className="size-5" />
                      </div>
                      <div className="text-body-sm flex grow grid-cols-[2fr_2fr_1fr] flex-wrap gap-x-3 gap-y-1 @lg:grid @lg:items-center">
                        <div>
                          <h4 className="text-link font-medium">
                            <Skeleton className="w-40" />
                          </h4>
                          <p className="text-body-xs text-muted-foreground mt-0.5">
                            <Skeleton className="w-20" />
                          </p>
                        </div>
                        <div>
                          <h4 className="flex gap-1 font-normal">
                            {t('txns.from')} <Skeleton className="w-40" />
                          </h4>
                          <h4 className="flex gap-1 pt-0 font-normal">
                            {t('txns.to')} <Skeleton className="w-40" />
                          </h4>
                        </div>
                        <div className="@lg:ml-auto">
                          <Badge className="text-body-xs h-6" variant="teal">
                            <NearCircle />
                            <Skeleton className="w-10" />
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {i != 9 && <Separator className="my-2.5" />}
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
                    <div className="flex items-center gap-3 *:leading-[140%]">
                      <div className="bg-muted rounded-lg p-2">
                        <LuArrowLeftRight className="size-5" />
                      </div>
                      <div className="text-body-sm flex grow grid-cols-[2fr_2fr_1fr] flex-wrap gap-x-3 gap-y-1 @lg:grid @lg:items-center">
                        <div>
                          <h4 className="text-link flex font-medium">
                            <Link
                              className="inline-block w-40 truncate"
                              href={`/txns/${txn.transaction_hash}`}
                            >
                              {txn.transaction_hash}
                            </Link>
                          </h4>
                          <p className="text-body-xs text-muted-foreground mt-0.5">
                            <TimeAgo ns={txn.block?.block_timestamp} />
                          </p>
                        </div>
                        <div>
                          <h4 className="flex gap-1 font-normal">
                            {t('txns.from')}{' '}
                            <Link
                              className="text-link inline-block w-40 truncate"
                              href={`/address/${txn.signer_account_id}`}
                            >
                              {txn.signer_account_id}
                            </Link>
                          </h4>
                          <h4 className="flex gap-1 pt-0 font-normal">
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
                          <Badge className="text-body-xs h-6" variant="teal">
                            <NearCircle />
                            {nearFormat(txn.actions_agg.deposit, {
                              maximumFractionDigits: 2,
                              notation: 'compact',
                            })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {txns.length != i + 1 && <Separator className="my-2.5" />}
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
