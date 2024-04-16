import React, { Ref, forwardRef } from 'react';
import Skeleton from './Skeleton';
import useTranslation from 'next-translate/useTranslation';
import ArrowDown from '@/components/Icons/ArrowDown';
interface Props {
  network: string;
  txns?: boolean;
  className?: string;
  pageTab?: string;
}
const Detail = forwardRef(
  ({ network, txns, className, pageTab }: Props, ref: Ref<HTMLDivElement>) => {
    const { t } = useTranslation('txns');
    return (
      <div ref={ref} className={`w-full z-10 ${className} pr-2`}>
        {!txns && (
          <div className="md:flex items-center justify-between">
            <div className="w-80 max-w-xs px-3 py-5">
              <Skeleton className="h-7" />
            </div>{' '}
          </div>
        )}
        {txns === true && (
          <div>
            <div
              className={`text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-2 mr-3 focus:outline-none ${
                pageTab === ' '
                  ? 'rounded-lg bg-green-600 dark:bg-green-250 dark:text-black text-white'
                  : 'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-600 rounded-lg hover:text-nearblue-600 dark:text-neargray-10'
              }`}
            >
              {t('txn.tabs.overview')}
            </div>{' '}
            <div
              className={`text-xs leading-4 font-medium rounded-lg overflow-hidden inline-block cursor-pointer p-2 mb-2 mr-3 focus:outline-none ${
                pageTab === 'execution'
                  ? 'rounded-lg bg-green-600 dark:bg-green-250 dark:text-black text-white'
                  : 'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-600 rounded-lg hover:text-nearblue-600 dark:text-neargray-10'
              }`}
            >
              <span className="flex">
                {t('txn.tabs.execution')}

                <ArrowDown className="h-4 w-4 fill-current ml-1" />
              </span>
            </div>{' '}
            <div
              className={`text-nearblue-600  text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-2 mr-3 focus:outline-none ${
                pageTab === 'comments'
                  ? 'rounded-lg bg-green-600 dark:bg-green-250 dark:text-black text-white'
                  : 'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-600 rounded-lg hover:text-nearblue-600 dark:text-neargray-10'
              }`}
            >
              {t('txn.tabs.comments')}
            </div>{' '}
          </div>
        )}
        <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 divide-solid dark:divide-black-200  divide-gray-200 divide-y soft-shadow rounded-xl mr-4">
          {network === 'testnet' && (
            <div className="flex flex-wrap p-4 text-red-500">
              <div className="max-w-lg w-44 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          )}
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <div className="max-w-lg w-36 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="w-1/2 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <div className="max-w-lg w-36 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="w-1/2 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <div className="max-w-lg w-36 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="w-1/2 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <div className="max-w-lg w-36 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="w-1/2 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <div className="max-w-lg w-36 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="w-1/2 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <div className="max-w-lg w-36 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="w-1/2 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <div className="max-w-lg w-36 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="w-1/2 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <div className="max-w-lg w-36 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="w-1/2 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <div className="max-w-lg w-36 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="w-1/2 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap p-4">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              <div className="max-w-lg w-36 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>

            <div className="w-full md:w-3/4">
              <div className="w-1/2 py-0.5">
                <Skeleton className="h-4" />
              </div>
            </div>
          </div>
          {network === 'mainnet' && (
            <div className="flex flex-wrap p-4">
              <div className="w-full md:w-1/4 mb-2 md:mb-0">
                <div className="max-w-lg w-36 py-0.5">
                  <Skeleton className="h-4" />
                </div>
              </div>

              <div className="w-full md:w-3/4">
                <div className="w-1/2 py-0.5">
                  <Skeleton className="h-4" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
Detail.displayName = 'Detail';
export default Detail;
