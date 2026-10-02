'use client';

import { use } from 'react';

import type { TxnReceipt } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import type { NearPrice } from '@/lib/txn';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { EnhancedPlan } from './enhanced';

type Props = {
  loading?: boolean;
  pricePromise?: Promise<NearPrice | null>;
  receiptsPromise?: Promise<null | TxnReceipt>;
  tid?: string;
};

export const Enhanced = ({
  loading,
  pricePromise,
  receiptsPromise,
  tid,
}: Props) => {
  const receipts = !loading && receiptsPromise ? use(receiptsPromise) : null;
  const price = !loading && pricePromise ? use(pricePromise) : null;

  return (
    <Card>
      <CardContent className="px-0 py-4 text-body-sm">
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
                <div className="ml-2 border-l-2 border-border py-2.5 pl-6">
                  <Skeleton className="h-5.5 w-40 rounded-md" />
                </div>
                <div className="flex items-center gap-2 py-1">
                  <Skeleton className="size-4 rounded-full" />
                  <span className="flex h-7 items-center">
                    <Skeleton className="w-36" />
                  </span>
                </div>
                <div className="ml-2 border-l-2 border-border py-2.5 pl-6">
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
              <EnhancedPlan nearPrice={price} receipts={receipts} tid={tid} />
            );
          }}
        </SkeletonSlot>
      </CardContent>
    </Card>
  );
};
