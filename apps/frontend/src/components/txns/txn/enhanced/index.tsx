'use client';

import { use } from 'react';

import type { TxnReceipt } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { EnhancedPlan } from './enhanced';

type Props = {
  loading?: boolean;
  receiptsPromise?: Promise<null | TxnReceipt>;
  tid?: string;
};

export const Enhanced = ({ loading, receiptsPromise, tid }: Props) => {
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;

  return (
    <Card>
      <CardContent className="text-body-sm px-0 py-4">
        <SkeletonSlot
          fallback={
            <div className="px-4 md:px-8">
              <div className="flex justify-end">
                <Skeleton className="absolute h-7 w-25" />
              </div>
              <div>
                <div className="flex items-center gap-2 py-1">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-7 w-40" />
                </div>
                <div className="border-border ml-2 border-l-2 py-2.5 pl-6">
                  <Skeleton className="h-8 w-40" />
                </div>
                <div className="flex items-center gap-2 py-1">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-7 w-36" />
                </div>
                <div className="border-border ml-2 border-l-2 py-2.5 pl-6">
                  <Skeleton className="h-8 w-30" />
                </div>
                <div className="flex items-center gap-2 py-1">
                  <Skeleton className="size-4 rounded-full" />
                  <Skeleton className="h-7 w-40" />
                </div>
              </div>
            </div>
          }
          loading={loading || !receipts}
        >
          {() => <EnhancedPlan receipts={receipts!} tid={tid} />}
        </SkeletonSlot>
      </CardContent>
    </Card>
  );
};
