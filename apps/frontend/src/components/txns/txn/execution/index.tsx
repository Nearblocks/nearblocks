'use client';

import { use } from 'react';

import type { TxnReceipt } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import type { NearPrice } from '@/lib/txn';
import { Card, CardContent } from '@/ui/card';

import { ExecutionPlan } from './execution';
import { ReceiptBlock } from './receipt';

type Props = {
  loading?: boolean;
  pricePromise?: Promise<NearPrice | null>;
  receiptsPromise?: Promise<null | TxnReceipt>;
  tid?: string;
};

export const Execution = ({
  loading,
  pricePromise,
  receiptsPromise,
  tid,
}: Props) => {
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;
  const price = !loading && pricePromise ? use(pricePromise) : null;

  return (
    <Card>
      <CardContent className="px-0 py-2">
        <SkeletonSlot
          fallback={
            <div className="ml-0 divide-border md:divide-y md:border-l-4 md:border-border">
              <ReceiptBlock loading />
            </div>
          }
          loading={!!loading}
        >
          {() => {
            if (!receipts) throw new Error('Failed to load receipts');
            return (
              <ExecutionPlan nearPrice={price} receipts={receipts} tid={tid} />
            );
          }}
        </SkeletonSlot>
      </CardContent>
    </Card>
  );
};
