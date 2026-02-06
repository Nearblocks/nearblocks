'use client';

import Link from 'next/link';
import { use } from 'react';

import { Account, AccountBalance, ContractDeployment } from 'nb-schemas';

import { List, ListItem, ListLeft, ListRight } from '@/components/list';
import { SkeletonSlot } from '@/components/skeleton';
import { TimeAgo } from '@/components/time-ago';
// import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { bytesFormat, nearFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  accountPromise?: Promise<Account | null>;
  balancePromise?: Promise<AccountBalance | null>;
  deploymentsPromise?: Promise<ContractDeployment[] | null>;
  loading?: boolean;
};

export const Info = ({ accountPromise, balancePromise, loading }: Props) => {
  // const { t } = useLocale('address');
  const account = !loading && accountPromise ? use(accountPromise) : null;
  const balance = !loading && balancePromise ? use(balancePromise) : null;

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">Information</CardTitle>
      </CardHeader>
      <CardContent className="px-3">
        <List pairsPerRow={2}>
          <ListItem>
            <ListLeft className="min-w-30">Staked Balance:</ListLeft>
            <ListRight>
              <p className="flex min-w-30 items-center gap-1">
                <NearCircle className="size-4" />{' '}
                <SkeletonSlot
                  fallback={<Skeleton className="w-20" />}
                  loading={loading || !balance || !balance?.amount_staked}
                >
                  {() => <>{nearFormat(balance!.amount_staked)}</>}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-30">Storage used:</ListLeft>
            <ListRight>
              <p className="flex items-center gap-1">
                <SkeletonSlot
                  fallback={<Skeleton className="w-20" />}
                  loading={loading || !balance || !balance?.storage_usage}
                >
                  {() => <>{bytesFormat(balance!.storage_usage)}</>}
                </SkeletonSlot>
              </p>
            </ListRight>
          </ListItem>
          <ListItem>
            <ListLeft className="min-w-30">Created:</ListLeft>
            <ListRight className="col-span-2">
              <p className="min-w-30">
                <SkeletonSlot
                  fallback={<Skeleton className="w-20" />}
                  loading={
                    loading || !account || !account?.created?.block_timestamp
                  }
                >
                  {() => (
                    <>
                      <TimeAgo ns={account!.created.block_timestamp} /> at txn{' '}
                      <Link
                        className="text-link inline-block w-30 truncate align-middle"
                        href={`/txns/${account!.created.transaction_hash}`}
                      >
                        {account!.created.transaction_hash}
                      </Link>
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
