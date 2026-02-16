'use client';

import { use } from 'react';

import type { TxnReceipt } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { Card, CardContent } from '@/ui/card';

import { ExecutionPlan } from './execution';
import { ReceiptBlock } from './receipt-block';

type Props = {
  loading?: boolean;
  receiptsPromise?: Promise<null | TxnReceipt>;
  txnHash?: string;
};

export const Execution = ({ loading, receiptsPromise, txnHash }: Props) => {
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;

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
          {() => <ExecutionPlan receipts={receipts!} txnHash={txnHash} />}
        </SkeletonSlot>
      </CardContent>
    </Card>
  );
};
