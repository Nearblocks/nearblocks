'use client';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { forwardRef, Ref } from 'react';

import { networkId } from '@/utils/config';

import Skeleton from '../common/Skeleton';
interface Props {
  className?: string;
}
const HomeOverview = forwardRef(
  ({ className }: Props, ref: Ref<HTMLDivElement>) => {
    const t = useTranslations('homePage');
    const { theme } = useTheme();
    return (
      <div className={`w-full z-10 ${className}`} ref={ref}>
        <div className="container-xxl w-full mx-auto px-3">
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden px-5 md:py lg:px-0">
            <div
              className={`grid grid-flow-col grid-cols-1 ${
                networkId === 'mainnet'
                  ? 'grid-rows-3 lg:grid-cols-3'
                  : 'grid-rows-2 lg:grid-cols-2'
              } lg:grid-rows-1 dark:divide-black-200 divide-y lg:divide-y-0 lg:divide-x lg:py-3`}
            >
              {networkId === 'mainnet' && (
                <>
                  <div className="flex flex-col lg:flex-col lg:items-stretch dark:divide-black-200 divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:pb-0 md:px-5">
                    <div className="flex flex-row py-5 lg:pb-5 lg:px-0">
                      <div className="items-center flex justify-left mr-3 ">
                        <Image
                          alt={t('nearPrice')}
                          height="24"
                          src={`/images/${
                            theme === 'dark'
                              ? 'near_price_dark.svg'
                              : 'near_price.svg'
                          }`}
                          width="24"
                        />
                      </div>
                      <div className="ml-2">
                        <p className="uppercase font-semibold text-nearblue-600 text-sm ">
                          {t('nearPrice')}
                        </p>
                        <div className="py-1">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row py-5 lg:pt-5 lg:px-0">
                      <div className="items-center flex justify-left mr-3 ">
                        <Image
                          alt={t('marketCap')}
                          height="24"
                          src={`/images/${
                            theme === 'dark' ? 'market_dark.svg' : 'market.svg'
                          }`}
                          width="24"
                        />
                      </div>
                      <div className="ml-2">
                        <p className="uppercase font-semibold text-nearblue-600 text-sm">
                          {t('marketCap')}{' '}
                        </p>
                        <div className="py-1 ">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <div className="flex flex-col lg:flex-col lg:items-stretch dark:divide-black-200 divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:pb-0 md:px-5">
                <div className="flex flex-row justify-between py-5 lg:pb-5 lg:px-0">
                  <div className="flex flex-row ">
                    <div className="items-center flex justify-left mr-3 ">
                      <Image
                        alt={t('transactions')}
                        height="24"
                        src={`/images/${
                          theme === 'dark'
                            ? 'transactions_dark.svg'
                            : 'transactions.svg'
                        }`}
                        width="24"
                      />
                    </div>
                    <div className="ml-2">
                      <p className="uppercase font-semibold text-nearblue-600 text-sm">
                        {t('transactions')}
                      </p>
                      <div className="py-1">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <p className="uppercase font-semibold text-nearblue-600 text-sm">
                      {' '}
                      {t('gasPrice')}
                    </p>

                    <div className="py-1">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                </div>
                <div className="pt-1 flex flex-row justify-between align-center py-5 lg:pt-5 lg:px-0">
                  <div className="flex flex-row ">
                    <div className="items-center flex justify-left mr-3 ">
                      <Image
                        alt={t('activeValidator')}
                        height="24"
                        src={`/images/${
                          theme === 'dark' ? 'pickaxe_dark.svg' : 'pickaxe.svg'
                        }`}
                        width="24"
                      />
                    </div>
                    <div className="ml-2">
                      <p className="uppercase font-semibold text-nearblue-600 text-sm">
                        {t('activeValidator')}
                      </p>
                      <div className="py-1">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <p className="uppercase font-semibold text-nearblue-600 text-sm">
                      {t('avgBlockTime')}
                    </p>
                    <div className="py-1">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-col lg:items-stretch dark:divide-black-200 divide-y lg:divide-y lg:divide-x-0 md:pt-0 md:px-5">
                <div className="flex-1 py-5 lg:px-0">
                  <p className="uppercase font-semibold text-nearblue-600 text-sm">
                    {' '}
                    {t('transactionHistory', { days: 14 })}
                  </p>
                  <div className="mt-1">
                    <Skeleton className="h-28 " />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
HomeOverview.displayName = 'Overview';
export default HomeOverview;
