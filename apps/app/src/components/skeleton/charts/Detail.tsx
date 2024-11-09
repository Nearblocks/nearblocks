import { useTranslations } from 'next-intl';
import React, { forwardRef, Ref } from 'react';

import { networkId } from '@/utils/config';

import Skeleton from '../common/Skeleton';

interface Props {
  chartTypes: string;
  className?: string;
}
const charts = [
  {
    exclude: networkId === 'testnet',
    link: '/charts/near-price',
    text: 'nearPrice.heading',
  },
  {
    exclude: networkId === 'testnet',
    link: '/charts/market-cap',
    text: 'marketCap.heading',
  },
  {
    exclude: false,
    link: '/charts/near-supply',
    text: 'nearSupply.heading',
  },
  {
    exclude: false,
    link: '/charts/txns',
    text: 'txns.heading',
  },
  {
    exclude: false,
    link: '/charts/blocks',
    text: 'blocks.heading',
  },
  {
    exclude: false,
    link: '/charts/addresses',
    text: 'addresses.heading',
  },
  {
    exclude: networkId === 'testnet',
    link: '/charts/txn-fee',
    text: 'txnFee.heading',
  },
  {
    exclude: networkId === 'testnet',
    link: '/charts/txn-volume',
    text: 'txnVolume.heading',
  },
  {
    exclude: false,
    link: '/charts/tps',
    text: 'Near Transactions per Second Chart',
  },
];
const Index = forwardRef(
  ({ chartTypes, className }: Props, ref: Ref<HTMLDivElement>) => {
    const t = useTranslations();
    return (
      <div className={`w-full z-10 ${className}`} ref={ref}>
        {chartTypes && (
          <>
            <div
              className="block bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden mb-10"
              style={{ height: 580 }}
            >
              <div className="leading-7 px-4 text-sm py-4 text-nearblue-600 border-b dark:border-black-200">
                <div className="max-w-xs py-1">
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <div className="pl-2 pr-2 py-8 h-full">
                <Skeleton className="h-[93%] w-full" />
              </div>
            </div>
            <h2 className="mb-4 px-2 text-lg opacity-70 text-gray-700 dark:text-neargray-10">
              {t('otherHeading')}
            </h2>
          </>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {charts.map((chart) => (
            <>
              {chart.exclude === false && (
                <div
                  className="block bg-white border dark:bg-black-600 dark:border-black-200 soft-shadow rounded-xl overflow-hidden"
                  key={chart.link}
                >
                  <div>
                    <a className="block leading-7 p-3 text-sm text-nearblue-600 border-b  dark:border-black-200 truncate">
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
  },
);
Index.displayName = 'Index';
export default Index;
