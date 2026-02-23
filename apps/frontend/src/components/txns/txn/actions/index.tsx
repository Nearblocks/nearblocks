'use client';

import { use } from 'react';

import { Txn } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { SkeletonSlot } from '@/components/skeleton';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea } from '@/ui/scroll-area';
import { Skeleton } from '@/ui/skeleton';

import { Action } from './action';
import { TxnIcon } from './icon';

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
            {() => <TxnIcon actions={txn!.actions} />}
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
                <ScrollArea className="max-h-40">
                  <div className="space-y-1">
                    {(txn!.actions[0]?.action === ActionKind.DELEGATE_ACTION
                      ? [txn!.actions[0]]
                      : txn!.actions
                    ).map((action, index) => (
                      <Action
                        action={action}
                        key={index}
                        receiver={txn!.receiver_account_id}
                        signer={txn!.signer_account_id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </SkeletonSlot>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
