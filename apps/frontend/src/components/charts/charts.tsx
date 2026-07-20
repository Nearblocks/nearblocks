'use client';

import dynamic from 'next/dynamic';

import { Card, CardContent, CardHeader } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

import { ChartSkeleton } from './chart-skeleton';

// Mirrors the loaded chart markup (Card > ChartHeader > CardContent > chart
// slot) so swapping the module-loading skeleton for the mounted chart doesn't
// shift the page.
const ChartCardSkeleton = () => (
  <Card>
    <CardHeader className="flex-wrap gap-2 border-b">
      {/* Inline segments wrap like the ~90-char description text does, so the
          header reserves the same 1-line desktop / 2-3-line mobile height. */}
      <p className="text-body-sm">
        <Skeleton className="w-64" /> <Skeleton className="w-56" />{' '}
        <Skeleton className="w-44" />
      </p>
      <span className="flex items-center gap-2 leading-6 whitespace-nowrap">
        <Skeleton className="w-28" />
      </span>
    </CardHeader>
    <CardContent className="p-3">
      <div className="h-140">
        <ChartSkeleton />
      </div>
    </CardContent>
  </Card>
);

export const PriceChart = dynamic(
  () => import('./near-price').then((m) => m.PriceChart),
  { loading: () => <ChartCardSkeleton />, ssr: false },
);

export const PriceChartMini = dynamic(
  () => import('./near-price').then((m) => m.PriceChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const MarketCapChart = dynamic(
  () => import('./market-cap').then((m) => m.MarketCapChart),
  { loading: () => <ChartCardSkeleton />, ssr: false },
);

export const MarketCapChartMini = dynamic(
  () => import('./market-cap').then((m) => m.MarketCapChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const SupplyChart = dynamic(
  () => import('./near-supply').then((m) => m.SupplyChart),
  { loading: () => <ChartCardSkeleton />, ssr: false },
);

export const SupplyChartMini = dynamic(
  () => import('./near-supply').then((m) => m.SupplyChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const TxnsChart = dynamic(
  () => import('./txns').then((m) => m.TxnsChart),
  { loading: () => <ChartCardSkeleton />, ssr: false },
);

export const TxnsChartMini = dynamic(
  () => import('./txns').then((m) => m.TxnsChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const BlocksChart = dynamic(
  () => import('./blocks').then((m) => m.BlocksChart),
  { loading: () => <ChartCardSkeleton />, ssr: false },
);

export const BlocksChartMini = dynamic(
  () => import('./blocks').then((m) => m.BlocksChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const AddressesChart = dynamic(
  () => import('./addresses').then((m) => m.AddressesChart),
  { loading: () => <ChartCardSkeleton />, ssr: false },
);

export const AddressesChartMini = dynamic(
  () => import('./addresses').then((m) => m.AddressesChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const TxnFeeChart = dynamic(
  () => import('./txn-fee').then((m) => m.TxnFeeChart),
  { loading: () => <ChartCardSkeleton />, ssr: false },
);

export const TxnFeeChartMini = dynamic(
  () => import('./txn-fee').then((m) => m.TxnFeeChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const TxnVolumeChart = dynamic(
  () => import('./txn-volume').then((m) => m.TxnVolumeChart),
  { loading: () => <ChartCardSkeleton />, ssr: false },
);

export const TxnVolumeChartMini = dynamic(
  () => import('./txn-volume').then((m) => m.TxnVolumeChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const TpsChart = dynamic(() => import('./tps').then((m) => m.TpsChart), {
  loading: () => <ChartCardSkeleton />,
  ssr: false,
});

export const TpsChartMini = dynamic(
  () => import('./tps').then((m) => m.TpsChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);
