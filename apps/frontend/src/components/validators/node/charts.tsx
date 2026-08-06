'use client';

import dynamic from 'next/dynamic';

import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

const ProductionCardSkeleton = () => (
  <Card>
    <CardContent className="p-3">
      <div className="h-105">
        <Skeleton className="h-105 w-full" />
      </div>
    </CardContent>
  </Card>
);

export const ProductionChart = dynamic(
  () => import('./production').then((mod) => mod.ProductionChart),
  {
    loading: () => <ProductionCardSkeleton />,
    ssr: false,
  },
);
