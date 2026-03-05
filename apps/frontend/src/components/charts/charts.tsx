'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/ui/skeleton';

export const PriceChart = dynamic(
  () => import('./near-price').then((m) => m.PriceChart),
  { loading: () => <Skeleton className="h-161 w-full" />, ssr: false },
);

export const PriceChartMini = dynamic(
  () => import('./near-price').then((m) => m.PriceChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const MarketCapChart = dynamic(
  () => import('./market-cap').then((m) => m.MarketCapChart),
  { loading: () => <Skeleton className="h-161 w-full" />, ssr: false },
);

export const MarketCapChartMini = dynamic(
  () => import('./market-cap').then((m) => m.MarketCapChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const SupplyChart = dynamic(
  () => import('./near-supply').then((m) => m.SupplyChart),
  { loading: () => <Skeleton className="h-161 w-full" />, ssr: false },
);

export const SupplyChartMini = dynamic(
  () => import('./near-supply').then((m) => m.SupplyChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const TxnsChart = dynamic(
  () => import('./txns').then((m) => m.TxnsChart),
  { loading: () => <Skeleton className="h-161 w-full" />, ssr: false },
);

export const TxnsChartMini = dynamic(
  () => import('./txns').then((m) => m.TxnsChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const BlocksChart = dynamic(
  () => import('./blocks').then((m) => m.BlocksChart),
  { loading: () => <Skeleton className="h-161 w-full" />, ssr: false },
);

export const BlocksChartMini = dynamic(
  () => import('./blocks').then((m) => m.BlocksChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const AddressesChart = dynamic(
  () => import('./addresses').then((m) => m.AddressesChart),
  { loading: () => <Skeleton className="h-161 w-full" />, ssr: false },
);

export const AddressesChartMini = dynamic(
  () => import('./addresses').then((m) => m.AddressesChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const TxnFeeChart = dynamic(
  () => import('./txn-fee').then((m) => m.TxnFeeChart),
  { loading: () => <Skeleton className="h-161 w-full" />, ssr: false },
);

export const TxnFeeChartMini = dynamic(
  () => import('./txn-fee').then((m) => m.TxnFeeChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);

export const TxnVolumeChart = dynamic(
  () => import('./txn-volume').then((m) => m.TxnVolumeChart),
  { loading: () => <Skeleton className="h-161 w-full" />, ssr: false },
);

export const TxnVolumeChartMini = dynamic(
  () => import('./txn-volume').then((m) => m.TxnVolumeChartMini),
  { loading: () => <Skeleton className="my-3 h-49 w-full" />, ssr: false },
);
