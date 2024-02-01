import React, { Ref, forwardRef } from 'react';
import Skeleton from '../common/Skeleton';
import useTranslation from 'next-translate/useTranslation';
import { networkId } from '@/utils/config';

interface Props {
  chartTypes: string;
  className?: string;
}
const charts = [
  {
    link: '/charts/near-price',
    text: 'nearPrice.heading',
    exclude: networkId === 'testnet',
  },
  {
    link: '/charts/market-cap',
    text: 'marketCap.heading',
    exclude: networkId === 'testnet',
  },
  {
    link: '/charts/near-supply',
    text: 'nearSupply.heading',
    exclude: false,
  },
  {
    link: '/charts/txns',
    text: 'txns.heading',
    exclude: false,
  },
  {
    link: '/charts/blocks',
    text: 'blocks.heading',
    exclude: false,
  },
  {
    link: '/charts/addresses',
    text: 'addresses.heading',
    exclude: false,
  },
  {
    link: '/charts/txn-fee',
    text: 'txnFee.heading',
    exclude: networkId === 'testnet',
  },
  {
    link: '/charts/txn-volume',
    text: 'txnVolume.heading',
    exclude: networkId === 'testnet',
  },
];
const Index = forwardRef(
  ({ chartTypes, className }: Props, ref: Ref<HTMLDivElement>) => {
    const { t } = useTranslation('charts');
    return (
      <div ref={ref} className={`w-full z-10 ${className}`}>
        {chartTypes && (
          <div
            className="block bg-white border soft-shadow rounded-xl overflow-hidden mb-10"
            style={{ height: 580 }}
          >
            <div className="leading-7 px-4 text-sm py-4 text-nearblue-600 border-b">
              <div className="max-w-xs py-1">
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="pl-2 pr-2 py-8 h-full">
              <Skeleton className="h-[93%] w-full" />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {charts.map((chart) => (
            <>
              {chart.exclude === false && (
                <div
                  className="block bg-white border soft-shadow rounded-xl overflow-hidden"
                  key={chart.link}
                >
                  <div>
                    <a className="block leading-7 p-3 text-sm text-nearblue-600 border-b truncate">
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
