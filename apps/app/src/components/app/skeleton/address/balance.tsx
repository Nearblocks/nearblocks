'use client';
import { useTranslations } from 'next-intl';
import React from 'react';

import { useConfig } from '@/hooks/app/useConfig';

import Skeleton from '../common/Skeleton';

export default function BalanceSkeleton() {
  const t = useTranslations();
  const { networkId } = useConfig();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="w-full">
        <div className="h-full bg-white soft-shadow rounded-xl dark:bg-black-600">
          <div className="flex justify-between border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10">
            <h2 className="leading-6 text-sm font-semibold">
              {t('overview') || 'Overview'}
            </h2>
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
            <div className="flex-1 flex-wrap py-4">
              <div className="w-full md:w-1/4 mb-0.5">
                {t('balance') || 'Balance'}:
              </div>
              <Skeleton className="h-4 w-32 mb-0.5" />
            </div>
            {networkId === 'mainnet' && (
              <div className="flex-1 flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="w-full md:w-1/4 mb-0.5">
                  {t('value') || 'Value:'}
                </div>
                <Skeleton className="h-4 w-32 mb-0.5" />
              </div>
            )}
            <div className="flex-1 flex-wrap pt-4 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="w-full md:w-1/4 mb-1.5">
                {t('tokens') || 'Tokens:'}
              </div>
              <div className="w-full md:w-3/4 break-words z-10">
                <Skeleton className="h-7 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
          <h2 className="leading-6 border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
            {t('moreInfo') || 'Account information'}
          </h2>
          <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
            <div className="flex pb-3 justify-between">
              <div>
                <div className="flex-1 xl:flex-nowrap flex-wrap py-3 w-full">
                  <div className="w-full mb-2 md:mb-0 whitespace-nowrap">
                    Staked {t('balance') || 'Balance'}:
                  </div>
                  <div className="w-full break-words">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
              <div className="pr-[1.4rem]">
                <div className="ml-4 flex-1 xl:flex-nowrap flex-wrap py-3">
                  <div className="flex mb-2 md:mb-0 whitespace-nowrap">
                    {t('storageUsed') || 'Storage Used'}:
                  </div>
                  <div className="flex break-words">
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex-wrap items-center justify-between pt-4 pb-5">
              <div className="w-full md:w-1/4 mb-2 md:mb-0 whitespace-nowrap">
                Contract Creator:
              </div>
              <div className="w-full md:w-3/4 break-words">
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
            <div className="flex-1 justify-between">
              <div className="flex-1 xl:flex-nowrap flex-wrap items-center justify-between pt-4 pb-8 w-full">
                <div className="w-full mb-2 md:mb-0 whitespace-nowrap">
                  Created At
                </div>
                <div className="w-full break-words">
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-1 md:col-span-8 lg:col-span-1">
        <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl">
          <h2 className="leading-6 whitespace-nowrap border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold mb-0.5">
            Multichain Information
          </h2>
          <div className="px-3 py-4 text-sm text-nearblue-600 dark:text-neargray-10 flex items-center">
            <div className="w-full md:w-3/4 break-words my-1">
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
