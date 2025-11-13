'use client';
import { useTranslations } from 'next-intl';
import React, { use } from 'react';

import { useConfig } from '@/hooks/app/useConfig';

import Skeleton from '@/components/app/skeleton/common/Skeleton';

export default function BalanceSkeleton({
  error = false,
  deploymentPromise,
  ftPromise,
  nftPromise,
}: {
  deploymentPromise?: Promise<any>;
  ftPromise?: Promise<any>;
  nftPromise?: Promise<any>;
  error?: boolean;
}) {
  const deployment = deploymentPromise ? use(deploymentPromise) : null;
  const deploymentInfo = deployment?.deployments?.[0];

  const ft = ftPromise ? use(ftPromise) : null;
  const nft = nftPromise ? use(nftPromise) : null;
  const tokenTracker =
    (ft?.contracts?.[0]?.name ? 'token' : null) ||
    (nft?.contracts?.[0]?.name ? 'nft' : null);
  const t = useTranslations();
  const { networkId } = useConfig();
  const isContract = !!deploymentInfo;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="w-full">
        <div className="h-full bg-white soft-shadow rounded-xl dark:bg-black-600">
          <div className="flex justify-between border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10">
            <h2 className="leading-6 text-sm font-semibold">
              {t('overview') || 'Overview'}
            </h2>
            {error ? '' : <Skeleton className="h-4 w-16 mt-1" />}
          </div>
          <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
            <div className="xl:flex flex-wrap xl:flex-nowrap py-4 xl:mb-0 mb-1">
              <div className="w-36 xl:mb-0 mb-1.5">
                {t('balance') || 'Balance'}:
              </div>
              <div className="w-full break-words">
                {error ? '' : <Skeleton className="h-4 w-32" />}
              </div>
            </div>
            {networkId === 'mainnet' && (
              <div className="xl:flex flex-wrap xl:flex-nowrap py-4 text-sm text-nearblue-600 dark:text-neargray-10 xl:mb-0 mb-1">
                <div className="w-36 xl:mb-0 mb-1.5">
                  {t('value') || 'Value:'}
                </div>
                <div className="w-full break-words">
                  {error ? '' : <Skeleton className="h-4 w-48" />}
                </div>
              </div>
            )}
            <div className="xl:flex flex-wrap xl:flex-nowrap py-4 text-sm text-nearblue-600 dark:text-neargray-10 w-full">
              <div className="w-36 xl:mb-0 mb-1.5">
                {t('tokens') || 'Tokens:'}
              </div>
              <div className="break-words -my-1 z-10 flex w-full">
                {error ? '' : <Skeleton className="h-8 w-full" />}
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
            <div className="flex flex-wrap xl:flex-nowrap xl:w-[94.2%] lg:w-[95.3%] w-[93.5%] py-4 justify-between items-center">
              <div className="xl:flex xl:w-1/2 w-max items-center gap-x-5">
                <div className="whitespace-nowrap xl:mb-0 mb-1.5">
                  Staked {t('balance') || 'Balance'}:
                </div>
                <div className="w-20 h-5">
                  {error ? '' : <Skeleton className="h-4 w-32" />}
                </div>
              </div>
              <div className="xl:flex xl:w-1/2 w-max items-center gap-x-7">
                <div className="whitespace-nowrap xl:mb-0 mb-1.5">
                  {t('storageUsed') || 'Storage used'}:
                </div>
                <div className="w-20 h-5">
                  {error ? '' : <Skeleton className="h-4 w-16" />}
                </div>
              </div>
            </div>
            {isContract && (
              <div className="flex justify-between w-full py-4">
                <div className="flex justify-between xl:w-[85.5%] lg:w-[100%] w-[100%]">
                  <div
                    className={`xl:flex w-full items-center ${
                      deploymentInfo?.receipt_predecessor_account_id
                        ? 'gap-x-2.5'
                        : 'gap-x-7'
                    }`}
                  >
                    <div className="whitespace-nowrap xl:mb-0 mb-1.5">
                      {deploymentInfo?.receipt_predecessor_account_id
                        ? 'Contract Creator:'
                        : 'Created At:'}
                    </div>
                    <div className="w-8/12">
                      {error ? (
                        ''
                      ) : (
                        <Skeleton
                          className={`h-4 w-full ${
                            !deploymentInfo?.receipt_predecessor_account_id &&
                            'ml-5'
                          }`}
                        />
                      )}
                    </div>
                  </div>
                  <div className="xl:flex xl:w-full justify-between w-max items-center gap-x-2">
                    <div className="whitespace-nowrap xl:mb-0 mb-1.5 flex">
                      Contract Locked:
                    </div>
                    <div className="break-words flex w-6 h-5">
                      {error ? '' : <Skeleton className="h-4 w-16" />}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {((isContract && deploymentInfo?.receipt_predecessor_account_id) ||
              !isContract) && (
              <div className="flex justify-between w-full py-4">
                <div className="xl:flex w-full break-words gap-x-12">
                  <div className="flex whitespace-nowrap xl:mb-0 mb-1.5">
                    Created At:
                  </div>
                  <div className="w-full">
                    {error ? '' : <Skeleton className="h-4 w-60" />}
                  </div>
                </div>
              </div>
            )}
            {isContract &&
              !deploymentInfo?.receipt_predecessor_account_id &&
              tokenTracker && (
                <div className="flex justify-between w-full py-4">
                  <div className="xl:flex w-full break-words gap-x-2">
                    <div className="flex whitespace-nowrap xl:mb-0 mb-1.5">
                      {tokenTracker === 'token'
                        ? 'Token Tracker:'
                        : 'NFT Token Tracker:'}
                    </div>
                    <div className="w-full">
                      {error ? '' : <Skeleton className="h-4 w-60 ml-1" />}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
      {/* <div className="col-span-1 md:col-span-8 lg:col-span-1">
        <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl">
          <h2 className="leading-6 whitespace-nowrap border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold mb-0.5">
            Multichain Information
          </h2>
          <div className="px-3 py-4 text-sm text-nearblue-600 dark:text-neargray-10 flex items-center">
            <div className="w-full md:w-3/4 break-words my-1">
              {error ? '' : <Skeleton className="h-4 w-72" />}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}
