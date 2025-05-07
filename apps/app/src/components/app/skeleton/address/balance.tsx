'use client';
import { useTranslations } from 'next-intl';
import React from 'react';

import { useConfig } from '@/hooks/app/useConfig';

import Skeleton from '../common/Skeleton';

export default function BalanceSkeleton({
  error = false,
  parse,
  deploymentInfo,
  tokenTracker,
}: {
  error?: boolean;
  parse: any;
  deploymentInfo: any;
  tokenTracker: any;
}) {
  const t = useTranslations();
  const { networkId } = useConfig();
  const isContract =
    parse?.contract?.[0]?.contract &&
    Array.isArray(parse?.contract?.[0]?.contract?.methodNames) &&
    parse.contract[0].contract.methodNames.length > 0;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="w-full">
        <div className="h-full bg-white soft-shadow rounded-xl dark:bg-black-600">
          <div className="flex justify-between border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10">
            <h2 className="leading-6 text-sm font-semibold">
              {t('overview') || 'Overview'}
            </h2>
            {error ? '' : <Skeleton className="h-4 w-16 mt-1" />}
          </div>
          <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
            <div className="flex-1 flex-wrap xl:flex-nowrap pt-4 pb-5">
              <div className="w-36 mb-1.5">{t('balance') || 'Balance'}:</div>
              <div className="w-full break-words">
                {error ? '' : <Skeleton className="h-4 w-32" />}
              </div>
            </div>
            {networkId === 'mainnet' && (
              <div className="flex-1 flex-wrap xl:flex-nowrap pt-4 pb-5 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="w-36 mb-1.5">{t('value') || 'Value:'}</div>
                <div className="w-full break-words">
                  {error ? '' : <Skeleton className="h-4 w-48" />}
                </div>
              </div>
            )}
            <div className="flex-1 flex-wrap xl:flex-nowrap py-4 text-sm text-nearblue-600 dark:text-neargray-10 w-full">
              <div className="w-36 mb-1.5">{t('tokens') || 'Tokens:'}</div>
              <div className="break-words flex w-full">
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
            <div className="flex flex-wrap xl:flex-nowrap xl:w-[94.9%] lg:w-[92.3%] w-[94%] py-4 justify-between items-center">
              <div>
                <div className="flex-1 w-full items-center">
                  <div className="whitespace-nowrap mb-1.5">
                    Staked {t('balance') || 'Balance'}:
                  </div>
                  <div className="w-20 h-5">
                    {error ? '' : <Skeleton className="h-4 w-32" />}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex-1 w-full items-center">
                  <div className="whitespace-nowrap mb-1.5">
                    {t('storageUsed') || 'Storage used'}:
                  </div>
                  <div className="w-20 h-5">
                    {error ? '' : <Skeleton className="h-4 w-16" />}
                  </div>
                </div>
              </div>
            </div>
            {(isContract || deploymentInfo?.receipt_predecessor_account_id) && (
              <div className="flex justify-between w-full py-4">
                <div className="flex-1 w-full items-center">
                  <div className="whitespace-nowrap mb-1.5">
                    {deploymentInfo?.receipt_predecessor_account_id ||
                    isContract
                      ? deploymentInfo?.receipt_predecessor_account_id
                        ? 'Contract Creator:'
                        : 'Created At:'
                      : 'Created At:'}
                  </div>
                  <div className="w-full">
                    {error ? '' : <Skeleton className="h-4 w-1/2" />}
                  </div>
                </div>
                <div>
                  <div className="flex-1 xl:w-full justify-between w-max items-center">
                    <div className="whitespace-nowrap mb-1.5 flex">
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
                <div
                  className={`flex-1 ${networkId !== 'mainnet' ? 'mb-1' : ''}`}
                >
                  <div className="flex whitespace-nowrap mb-1.5">
                    {tokenTracker
                      ? tokenTracker === 'token'
                        ? 'Token Tracker:'
                        : 'NFT Token Tracker:'
                      : 'Created At:'}
                  </div>
                  <div className="w-full">
                    {error ? (
                      ''
                    ) : (
                      <Skeleton
                        className={`h-4 ${tokenTracker ? 'w-5/6' : 'w-60'}`}
                      />
                    )}
                  </div>
                </div>
                {tokenTracker && (
                  <div className="flex-1 flex flex-col items-end mr-9">
                    <div className="flex whitespace-nowrap mb-1.5">
                      Created At:
                    </div>
                    <div className="w-[4.5rem]">
                      {error ? '' : <Skeleton className="h-4 w-full" />}
                    </div>
                  </div>
                )}
              </div>
            )}
            {isContract &&
              !deploymentInfo?.receipt_predecessor_account_id &&
              tokenTracker && (
                <div className="flex justify-between w-full py-4">
                  <div className="flex-1 w-full break-words gap-x-2">
                    <div className="flex whitespace-nowrap mb-1.5">
                      {tokenTracker === 'token'
                        ? 'Token Tracker:'
                        : 'NFT Token Tracker:'}
                    </div>
                    <div className="w-full flex">
                      {error ? '' : <Skeleton className="h-4 w-60 mt-0.5" />}
                    </div>
                  </div>
                </div>
              )}
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
              {error ? '' : <Skeleton className="h-4 w-72" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
