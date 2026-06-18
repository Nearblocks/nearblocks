'use client';

import { use } from 'react';

import type { Stats, TxnReceipt } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { Card, CardContent } from '@/ui/card';

import { ReceiptExpandedSection } from '../enhanced/action';
import { TreeNode } from './node';
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
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="px-3 pt-2 pb-6 md:w-1/2 lg:w-7/12">
                <TreeNode loading />
              </div>
              <div className="px-3 md:w-1/2 md:px-0 lg:w-5/12">
                <ReceiptExpandedSection loading />
              </div>
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
