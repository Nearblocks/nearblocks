'use client';

import { use } from 'react';

import type { Stats, TxnReceipt } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { EnhancedPlan } from './enhanced';

type Props = {
  loading?: boolean;
  receiptsPromise?: Promise<null | TxnReceipt>;
  statsPromise?: Promise<null | Stats>;
  tid?: string;
};

export const Enhanced = ({
  loading,
  receiptsPromise,
  statsPromise,
  tid,
}: Props) => {
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;
  const stats = !loading && statsPromise ? use(statsPromise) : null;

  return (
    <Card>
      <CardContent className="text-body-sm px-0 py-4">
        <SkeletonSlot
          fallback={
            <div className="px-4 md:px-8">
              <div className="hidden justify-end md:flex">
                <Skeleton className="absolute h-7 w-25" />
              </div>
              <div>
                <div className="flex items-center gap-2 py-1">
                  <Skeleton className="size-4 rounded-full" />
                  <span className="flex h-7 items-center">
                    <Skeleton className="w-40" />
                  </span>
                </div>
                <div className="border-border ml-2 border-l-2 py-2.5 pl-6">
                  <Skeleton className="h-5.5 w-40 rounded-md" />
                </div>
                <div className="flex items-center gap-2 py-1">
                  <Skeleton className="size-4 rounded-full" />
                  <span className="flex h-7 items-center">
                    <Skeleton className="w-36" />
                  </span>
                </div>
                <div className="border-border ml-2 border-l-2 py-2.5 pl-6">
                  <Skeleton className="h-5.5 w-30 rounded-md" />
                </div>
                <div className="flex items-center gap-2 py-1">
                  <Skeleton className="size-4 rounded-full" />
                  <span className="flex h-7 items-center">
                    <Skeleton className="w-40" />
                  </span>
                </div>
              </div>
            </div>
          }
          loading={!!loading}
        >
          {() => {
            if (!receipts) throw new Error('Failed to load receipts');
            return (
              <EnhancedPlan
                nearPrice={stats?.near_price}
                receipts={receipts}
                tid={tid}
              />
            );
          }}
        </SkeletonSlot>
      </CardContent>
    </Card>
  );
};
