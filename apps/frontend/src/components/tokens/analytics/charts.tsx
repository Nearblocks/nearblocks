'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/ui/skeleton';

export { OverviewChart } from './overview';

export const TransfersChart = dynamic(
  () => import('./transfers').then((m) => m.TransfersChart),
  { loading: () => <Skeleton className="h-105 w-full" />, ssr: false },
);
