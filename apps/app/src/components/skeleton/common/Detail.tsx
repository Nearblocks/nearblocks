import React, { Ref, forwardRef } from 'react';
import Skeleton from './Skeleton';
import useTranslation from 'next-translate/useTranslation';
interface Props {
  network: string;
  txns?: boolean;
}
const Detail = forwardRef(
  ({ network, txns }: Props, ref: Ref<HTMLDivElement>) => {
    const { t } = useTranslation('txns');
    return (
      <div ref={ref} className="absolute w-full z-50">
        <div className="md:flex items-center justify-between">
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>{' '}
        </div>
        {txns === true && (
          <div className="flex">
            <div
              className={`rounded-lg bg-green-600 text-white text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none `}
            >
              {t('txn.tabs.overview')}
            </div>{' '}
            <div
              className={`text-nearblue-600 hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none  `}
            >
              {t('txn.tabs.execution')}
            </div>{' '}
            <div
              className={`text-nearblue-600 hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none `}
            >
              {t('txn.tabs.comments')}
            </div>{' '}
          </div>
        )}
        <div className="bg-white text-sm text-gray-500 divide-solid divide-gray-200 divide-y soft-shadow rounded-xl">
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
