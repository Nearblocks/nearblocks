'use client';

import { use } from 'react';

import { Txn } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { Action } from './action';
import { Icon } from './icon';

type Props = {
  loading?: boolean;
  txnPromise?: Promise<null | Txn>;
};

export const Actions = ({ loading, txnPromise }: Props) => {
  const txn = !loading && txnPromise ? use(txnPromise) : null;

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex gap-3">
          <SkeletonSlot
            fallback={<Skeleton className="size-10 rounded-full" />}
            loading={loading || !txn}
          >
            {() => <Icon actions={txn!.actions} />}
          </SkeletonSlot>
          <div className="flex-1">
            <h2 className="text-headline-xs mb-1 font-bold uppercase">
              Transaction Actions
            </h2>
            <SkeletonSlot
              fallback={
                <div className="h-7 space-y-1 pt-1">
                  <Skeleton className="h-5 w-1/4" />
                </div>
              }
              loading={loading || !txn || txn.actions?.length === 0}
            >
              {() => (
                <div className="space-y-1">
                  {txn!.actions.map((action, index) => (
                    <Action
                      action={action}
                      key={index}
                      receiver={txn!.receiver_account_id}
                      signer={txn!.signer_account_id}
                    />
                  ))}
                </div>
              )}
            </SkeletonSlot>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
