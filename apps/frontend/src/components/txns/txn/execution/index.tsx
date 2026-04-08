'use client';

import { use } from 'react';

import type { Stats, TxnReceipt } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { Card, CardContent } from '@/ui/card';

import { ExecutionPlan } from './execution';
import { ReceiptBlock } from './receipt';

type Props = {
  loading?: boolean;
  receiptsPromise?: Promise<null | TxnReceipt>;
  statsPromise?: Promise<null | Stats>;
  tid?: string;
};

export const Execution = ({
  loading,
  receiptsPromise,
  statsPromise,
  tid,
}: Props) => {
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  return (
    <Card>
      <CardContent className="px-0 py-1">
        <SkeletonSlot
          fallback={
            <div className="border-border ml-0 border-l-4">
              <ReceiptBlock loading />
            </div>
          }
          loading={loading || !receipts}
        >
          {() => (
            <ExecutionPlan
              nearPrice={stats?.near_price}
              receipts={receipts!}
              tid={tid}
            />
          )}
        </SkeletonSlot>
      </CardContent>
    </Card>
  );
};
