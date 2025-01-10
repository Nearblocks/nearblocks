'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import { Link } from '@/i18n/routing';

import Skeleton from '../common/Skeleton';

const HomeOverview = ({ theme: cookieTheme }: { theme: string }) => {
  const { networkId } = useConfig();
  const t = useTranslations();
  let { theme } = useTheme();

  if (theme == undefined) {
    theme = cookieTheme;
  }

  return (
    <div className="container-xxl mx-auto px-5">
      <div className="bg-white soft-shadow rounded-xl overflow-hidden px-3 sm:px-5 md:py lg:px-0 dark:bg-black-600">
        <div
          className={`grid grid-flow-col grid-cols-1 ${
            networkId === 'mainnet'
              ? 'grid-rows-3 lg:grid-cols-3'
              : 'grid-rows-2 lg:grid-cols-2'
          } lg:grid-rows-1 divide-y lg:divide-y-0 lg:divide-x py-1 dark:divide-black-200`}
        >
          {networkId === 'mainnet' && (
            <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:pb-0 md:px-5">
              <div className="flex flex-row py-5 lg:pb-4 lg:px-0">
                <div className="items-center flex justify-left mr-3">
                  <Image
                    alt={t ? t('homePage.nearPrice') : 'nearPrice'}
                    height={24}
                    loading="eager"
                    src={`/images/${
                      theme === 'dark'
                        ? 'near_price_dark.svg'
                        : 'near_price.svg'
                    }`}
                    width={24}
                  />
                </div>
                <div className="ml-2 flex-1">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm ">
                    {t ? t('homePage.nearPrice') : 'NEAR PRICE'}
                  </p>
                  <Skeleton className="h-4 my-1 w-full max-w-[180px]" />
                </div>
              </div>
              <div className="flex flex-row py-5 lg:pt-4 lg:px-0">
                <div className="items-center flex justify-left mr-3">
                  <Image
                    alt={t ? t('homePage.marketCap') : 'marketCap'}
                    height={24}
                    loading="eager"
                    src={`/images/${
                      theme === 'dark' ? 'market_dark.svg' : 'market.svg'
                    }`}
                    width={24}
                  />
                </div>
                <div className="ml-2 flex-1">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    {t('homePage.marketCap')}
                  </p>
                  <Skeleton className="h-4 my-1 w-full max-w-[180px]" />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:pb-0 md:px-5">
            <div className="flex flex-row justify-between py-5 lg:pb-4 lg:px-0">
              <div className="flex flex-row">
                <div className="items-center flex justify-left mr-3">
                  <Image
                    alt={t ? t('homePage.transactions') : 'transactions'}
                    height={24}
                    loading="eager"
                    src={`/images/${
                      theme === 'dark'
                        ? 'transactions_dark.svg'
                        : 'transactions.svg'
                    }`}
                    width={24}
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    {t ? t('homePage.transactions') : 'TRANSACTIONS'}
                  </p>
                  <Skeleton className="h-4 my-1 sm:w-32" />
                </div>
              </div>
              <div className="flex flex-col text-right">
                <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                  {t ? t('homePage.gasPrice') : 'GAS PRICE'}
                </p>
                <Skeleton className="h-4 my-1 w-20" />
              </div>
            </div>
            <div className="flex flex-row justify-between py-5 lg:pt-4 lg:px-0">
              <div className="flex flex-row">
                <div className="items-center flex justify-left mr-3">
                  <Image
                    alt={t ? t('homePage.activeValidator') : 'activeValidator'}
                    height={24}
                    loading="eager"
                    src={`/images/${
                      (theme === 'dark' && 'pickaxe_dark.svg') || 'pickaxe.svg'
                    }`}
                    width={24}
                  />
                </div>
                <div className="ml-2">
                  <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                    <Link className="hover:no-underline" href="/node-explorer">
                      {t ? t('homePage.activeValidator') : 'ACTIVE VALIDATORS'}{' '}
                    </Link>
                  </p>
                  <Skeleton className="h-4 my-1 w-24" />
                </div>
              </div>
              <div className="relative flex flex-col text-right ">
                <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm">
                  {t ? t('homePage.avgBlockTime') : 'AVG. BLOCK TIME'}
                </p>
                <Skeleton className="h-4 my-1 w-16 absolute end-0 bottom-0" />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-1 flex flex-col lg:flex-col lg:items-stretch divide-y lg:divide-y lg:divide-x-0 dark:divide-black-200 md:pt-0 md:px-5">
            <div className="flex-1 py-4 lg:px-0">
              <p className="uppercase font-semibold text-nearblue-600 dark:text-neargray-10 text-sm dark:bg-black-600">
                {t
                  ? t('homePage.transactionHistory', { days: 14 })
                  : 'NEAR TRANSACTION HISTORY IN 14 DAYS'}
              </p>
              <Skeleton className="h-28 mt-1 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
HomeOverview.displayName = 'Overview';
export default HomeOverview;
