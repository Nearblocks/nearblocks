import React from 'react';
import Skeleton from '../common/Skeleton';
import { useTranslations } from 'next-intl';
import { networkId } from '@/utils/app/config';

export default function BalanceSkeleton() {
  const t = useTranslations();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="w-full">
        <div className="h-full bg-white soft-shadow rounded-xl dark:bg-black-600">
          <div className="flex justify-between border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10">
            <h2 className="leading-6 text-sm font-semibold">
              {t('overview') || 'Overview'}
            </h2>
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
            <div className="flex flex-wrap py-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('balance') || 'Balance'}:
              </div>
              <Skeleton className="h-4 w-32" />
            </div>
            {networkId === 'mainnet' && (
              <div className="flex flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t('value') || 'Value:'}
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
            )}
            <div className="flex flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                {t('tokens') || 'Tokens:'}
              </div>
              <div className="w-full md:w-3/4 break-words -my-1 z-10">
                <Skeleton className="h-8 w-full" />
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
            <div className="flex justify-between">
              <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                <div className="w-full mb-2 md:mb-0">
                  Staked {t('balance') || 'Balance'}:
                </div>
                <div className="w-full break-words">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex ml-4  xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                <div className="w-full mb-2 md:mb-0">
                  {t('storageUsed') || 'Storage Used'}:
                </div>
                <div className="w-full break-words">
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                <div className="w-full mb-2 md:mb-0">Created At</div>
                <div className="w-full break-words">
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between py-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                Contract Creator:
              </div>
              <div className="w-full md:w-3/4 break-words">
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
