'use client';

import { use } from 'react';

import type { Stats, TxnReceipt } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { Card, CardContent } from '@/ui/card';

import { ReceiptBlock } from '../execution/receipt';
import { TreePlan } from './tree-plan';

type Props = {
  loading?: boolean;
  receiptsPromise?: Promise<null | TxnReceipt>;
  statsPromise?: Promise<null | Stats>;
  tid?: string;
};

export const Tree = ({
  loading,
  receiptsPromise,
  statsPromise,
  tid,
}: Props) => {
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  return (
    <Card>
      <CardContent className="px-0 py-2">
        <SkeletonSlot
          fallback={
            <div className="border-border ml-0 border-l-4">
              <ReceiptBlock loading />
            </div>
          }
          loading={loading || !receipts}
        >
          {() => (
            <TreePlan
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
