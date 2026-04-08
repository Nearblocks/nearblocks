'use client';

import { use } from 'react';

import { Txn } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { ScrollableList } from '@/components/scrollable-list';
import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { Action } from './action';
import { TxnIcon } from './icon';

type Props = {
  loading?: boolean;
  txnPromise?: Promise<null | Txn>;
};

export const Actions = ({ loading, txnPromise }: Props) => {
  const { t } = useLocale('txns');
  const txn = !loading && txnPromise ? use(txnPromise) : null;

  return (
    <Card>
      <CardContent className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <SkeletonSlot
              fallback={<Skeleton className="size-10 rounded-full" />}
              loading={loading || !txn}
            >
              {() => <TxnIcon actions={txn!.actions} />}
            </SkeletonSlot>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-headline-xs font-medium uppercase">
              {t('actions.title')}
            </h2>
            <SkeletonSlot
              fallback={<Skeleton className="mt-0.5 h-5 w-1/4" />}
              loading={loading || !txn || txn.actions?.length === 0}
            >
              {() => {
                const actions =
                  txn!.actions[0]?.action === ActionKind.DELEGATE_ACTION
                    ? [txn!.actions[0]]
                    : txn!.actions;
                const content = (
                  <div className="text-body-sm space-y-1">
                    {actions.map((action, index) => (
                      <Action
                        action={action}
                        key={index}
                        receiver={txn!.receiver_account_id}
                        signer={txn!.signer_account_id}
                      />
                    ))}
                  </div>
                );
                return actions.length > 3 ? (
                  <ScrollableList className="max-h-40">
                    {content}
                  </ScrollableList>
                ) : (
                  content
                );
              }}
            </SkeletonSlot>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
