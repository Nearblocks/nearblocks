'use client';

import { ArrowLeftRight } from 'lucide-react';
import { Fragment } from 'react';
import { use } from 'react';

import { TxnListItem } from 'nb-schemas';

import { EmptyBox } from '@/components/empty';
import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { TimeAgo } from '@/components/time-ago';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat } from '@/lib/format';
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
  loading?: boolean;
  txnsPromise?: Promise<null | TxnListItem[]>;
};

export const Txns = ({ loading, txnsPromise }: Props) => {
  const txns = !loading && txnsPromise ? use(txnsPromise) : null;
  const { t } = useLocale('home');

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">{t('txns.title')}</CardTitle>
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
                          <div className="bg-muted shrink-0 rounded-lg p-2">
                            <ArrowLeftRight className="size-6" />
                          </div>
                          <div className="text-body-sm flex flex-col leading-tight">
                            <h4 className="text-link font-normal">
                              <Skeleton className="w-40" />
                            </h4>
                            <p className="text-body-2xs text-muted-foreground">
                              <Skeleton className="w-20" />
                            </p>
                          </div>
                        </div>
                        <Badge
                          className="text-body-xs h-6 w-20 shrink-0 @lg:hidden"
                          variant="teal"
                        >
                          <NearCircle />
                          <Skeleton className="w-10" />
                        </Badge>
                      </div>
                      <div className="text-body-sm grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1 gap-y-1 @lg:flex-1">
                        <h4 className="font-normal whitespace-nowrap">
                          {t('txns.from')}
                        </h4>
                        <span className="block">
                          <Skeleton className="w-40" />
                        </span>
                        <h4 className="font-normal whitespace-nowrap">
                          {t('txns.to')}
                        </h4>
                        <span className="block">
                          <Skeleton className="w-40" />
                        </span>
                      </div>
                      <Badge
                        className="text-body-xs hidden h-6 w-20 @lg:ml-auto @lg:inline-flex"
                        variant="teal"
                      >
                        <NearCircle />
                        <Skeleton className="w-10" />
                      </Badge>
                    </div>
                    {i != 9 && <Separator className="my-2.5" />}
                  </Fragment>
                ))}
              </>
            }
            loading={!!loading}
          >
            {() => {
              if (!txns) throw new Error('Failed to load latest transactions');
              if (!txns.length) {
                return (
                  <EmptyBox
                    description="No transactions found"
                    icon={<ArrowLeftRight />}
                  />
                );
              }
              return (
                <>
                  {txns.map((txn, i) => {
                    const amount = nearFormat(txn.actions_agg.deposit, {
                      maximumFractionDigits: 2,
                      notation: 'compact',
                    });
                    return (
                      <Fragment key={txn.transaction_hash}>
                        <div className="flex flex-col gap-2 *:leading-tight @lg:flex-row @lg:items-center @lg:gap-3">
                          <div className="flex items-center justify-between gap-3 @lg:flex-1 @lg:justify-start">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="bg-muted shrink-0 rounded-lg p-2">
                                <ArrowLeftRight className="size-6" />
                              </div>
                              <div className="text-body-sm flex min-w-0 flex-col leading-tight">
                                <h4 className="text-link flex font-normal">
                                  <Link
                                    className="inline-block w-40 truncate"
                                    href={`/txns/${txn.transaction_hash}`}
                                  >
                                    {txn.transaction_hash}
                                  </Link>
                                </h4>
                                <p className="text-body-2xs text-muted-foreground">
                                  <TimeAgo ns={txn.block?.block_timestamp} />
                                </p>
                              </div>
                            </div>
                            <Badge
                              className="text-body-xs h-6 w-20 shrink-0 @lg:hidden"
                              variant="teal"
                            >
                              <NearCircle />
                              {amount}
                            </Badge>
                          </div>
                          <div className="text-body-sm grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1 gap-y-1 @lg:flex-1">
                            <h4 className="font-normal whitespace-nowrap">
                              {t('txns.from')}
                            </h4>
                            <Link
                              className="text-link inline-block w-40 truncate"
                              href={`/address/${txn.signer_account_id}`}
                            >
                              {txn.signer_account_id}
                            </Link>
                            <h4 className="font-normal whitespace-nowrap">
                              {t('txns.to')}
                            </h4>
                            <Link
                              className="text-link inline-block w-40 truncate"
                              href={`/address/${txn.receiver_account_id}`}
                            >
                              {txn.receiver_account_id}
                            </Link>
                          </div>
                          <Badge
                            className="text-body-xs hidden h-6 w-20 @lg:ml-auto @lg:inline-flex"
                            variant="teal"
                          >
                            <NearCircle />
                            {amount}
                          </Badge>
                        </div>
                        {txns.length != i + 1 && (
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
          className="text-headline-sm w-full"
          size="lg"
          variant="secondary"
        >
          <Link href="/txns">
            {t('txns.button')} <span aria-hidden="true">&rarr;</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
