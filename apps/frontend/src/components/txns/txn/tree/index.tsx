'use client';

import { use } from 'react';

import type { TxnReceipt } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import type { NearPrice } from '@/lib/txn';
import { Card, CardContent } from '@/ui/card';
import { ScrollArea } from '@/ui/scroll-area';

import { ReceiptExpandedSection } from '../enhanced/action';
import { TreeNode } from './node';
import { TreePlan } from './tree-plan';

type Props = {
  loading?: boolean;
  pricePromise?: Promise<NearPrice | null>;
  receiptsPromise?: Promise<null | TxnReceipt>;
  tid?: string;
};

export const Tree = ({
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
            <div className="flex flex-col gap-4 md:flex-row">
              <ScrollArea className="self-start md:sticky md:top-2 md:max-h-[80vh] md:w-1/2 lg:w-7/12">
                <div className="px-3 pt-2 pb-6">
                  <TreeNode loading />
                </div>
              </ScrollArea>
              <div className="px-3 md:w-1/2 md:px-0 lg:w-5/12">
                <ReceiptExpandedSection loading />
              </div>
            </div>
          }
          loading={!!loading}
        >
          {() => {
            if (!receipts) throw new Error('Failed to load receipts');
            return <TreePlan nearPrice={price} receipts={receipts} tid={tid} />;
          }}
        </SkeletonSlot>
      </CardContent>
    </Card>
  );
};
