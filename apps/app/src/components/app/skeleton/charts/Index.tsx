'use client';
import { useTranslations } from 'next-intl';
import React, { forwardRef, Ref } from 'react';

import { useConfig } from '@/hooks/app/useConfig';

import Skeleton from '../common/Skeleton';

interface Props {
  className?: string;
}

const ChartSkeletion = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const t = useTranslations();
  const { networkId } = useConfig();

  const charts = [
    {
      exclude: networkId === 'testnet',
      image: '/images/charts/near-price.svg',
      link: '/charts/near-price',
      text: 'charts.nearPrice.heading',
    },
    {
      exclude: networkId === 'testnet',
      image: '/images/charts/market-cap.svg',
      link: '/charts/market-cap',
      text: 'marketCapCharts.heading',
    },
    {
      exclude: false,
      image: '/images/charts/near-supply.svg',
      link: '/charts/near-supply',
      text: 'nearSupplyCharts.heading',
    },
    {
      exclude: false,
      image: '/images/charts/txns.svg',
      link: '/charts/txns',
      text: 'txnsCharts.heading',
    },
    {
      exclude: false,
      image: '/images/charts/blocks.svg',
      link: '/charts/blocks',
      text: 'blocksCharts.heading',
    },
    {
      exclude: false,
      image: '/images/charts/addresses.svg',
      link: '/charts/addresses',
      text: 'addressesCharts.heading',
    },
    {
      exclude: networkId === 'testnet',
      image: '/images/charts/txn-fee.svg',
      link: '/charts/txn-fee',
      text: 'txnFeeCharts.heading',
    },
    {
      exclude: networkId === 'testnet',
      image: '/images/charts/txn-volume.svg',
      link: '/charts/txn-volume',
      text: 'txnVolumeCharts.heading',
    },
    {
      exclude: false,
      image: '/images/charts/tps.svg',
      link: '/charts/tps',
      text: 'Near Transactions per Second Chart',
    },
  ];
  return (
    <div className={`w-full z-10 ${props.className}`} ref={ref}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {charts.map((chart) => (
          <>
            {chart.exclude === false && (
              <div
                className="block bg-white dark:border-black-200 dark:bg-black-600 border soft-shadow rounded-xl overflow-hidden"
                key={chart.link}
              >
                <div>
                  <a className="block leading-7 p-3 text-sm text-nearblue-600 dark:text-neargray-10 border-b dark:border-black-200 truncate font-medium">
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
