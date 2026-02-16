'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/ui/skeleton';

export const TxnsChart = dynamic(
  () => import('./txns').then((mod) => mod.TxnsChart),
  {
    loading: () => <Skeleton className="h-105 w-full" />,
    ssr: false,
  },
);

export const BalanceChart = dynamic(
  () => import('./balance').then((mod) => mod.BalanceChart),
  {
    loading: () => <Skeleton className="h-105 w-full" />,
    ssr: false,
  },
);

export const FTsChart = dynamic(
  () => import('./fts').then((mod) => mod.FTsChart),
  {
    loading: () => <Skeleton className="h-105 w-full" />,
    ssr: false,
  },
);

export const NearChart = dynamic(
  () => import('./near').then((mod) => mod.NearChart),
  {
    loading: () => <Skeleton className="h-105 w-full" />,
    ssr: false,
  },
);
