'use client';
import React, { Ref, forwardRef } from 'react';
import Skeleton from '../common/Skeleton';
import { useTranslations } from 'next-intl';
import { useConfig } from '@/hooks/app/useConfig';

interface Props {
  className?: string;
}

const ChartSkeletion = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const t = useTranslations();
  const { networkId } = useConfig();

  const charts = [
    {
      link: '/charts/near-price',
      text: 'charts.nearPrice.heading',
      image: '/images/charts/near-price.svg',
      exclude: networkId === 'testnet',
    },
    {
      link: '/charts/market-cap',
      text: 'marketCapCharts.heading',
      image: '/images/charts/market-cap.svg',
      exclude: networkId === 'testnet',
    },
    {
      link: '/charts/near-supply',
      text: 'nearSupplyCharts.heading',
      image: '/images/charts/near-supply.svg',
      exclude: false,
    },
    {
      link: '/charts/txns',
      text: 'txnsCharts.heading',
      image: '/images/charts/txns.svg',
      exclude: false,
    },
    {
      link: '/charts/blocks',
      text: 'blocksCharts.heading',
      image: '/images/charts/blocks.svg',
      exclude: false,
    },
    {
      link: '/charts/addresses',
      text: 'addressesCharts.heading',
      image: '/images/charts/addresses.svg',
      exclude: false,
    },
    {
      link: '/charts/txn-fee',
      text: 'txnFeeCharts.heading',
      image: '/images/charts/txn-fee.svg',
      exclude: networkId === 'testnet',
    },
    {
      link: '/charts/txn-volume',
      text: 'txnVolumeCharts.heading',
      image: '/images/charts/txn-volume.svg',
      exclude: networkId === 'testnet',
    },
    {
      link: '/charts/tps',
      text: 'Near Transactions per Second Chart',
      image: '/images/charts/tps.svg',
      exclude: false,
    },
  ];
  return (
    <div ref={ref} className={`w-full z-10 ${props.className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {charts.map((chart) => (
          <>
            {chart.exclude === false && (
              <div
                className="block bg-white dark:border-black-200 dark:bg-black-600 border soft-shadow rounded-xl overflow-hidden"
                key={chart.link}
              >
                <div>
                  <a className="block leading-7 p-3 text-sm text-nearblue-600 border-b dark:border-black-200 truncate">
                    <h2>{t(chart.text)}</h2>
                  </a>
                </div>
                <div className="pl-2 pr-2 py-8">
                  <div>
                    <Skeleton className="h-72" />
                  </div>
                </div>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
});
ChartSkeletion.displayName = 'ChartSkeletion';
export default ChartSkeletion;
