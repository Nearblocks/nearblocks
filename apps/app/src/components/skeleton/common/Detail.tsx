import React from 'react';
import Skeleton from './Skeleton';

const Detail = ({ network }: any) => {
  return (
    <div className="absolute w-full z-50">
      <div className="md:flex items-center justify-between bg-white">
        <div className="w-80 max-w-xs px-3 py-5">
          <Skeleton className="h-7" />
        </div>{' '}
        <div className="w-80 max-w-xs px-3 py-5">
          <Skeleton className="h-7" />
        </div>
      </div>

      <div className="bg-white text-sm text-gray-500 divide-solid divide-gray-200 divide-y soft-shadow rounded-lg">
        {network === 'testnet' && (
          <div className="flex flex-wrap p-4 text-red-500">
            <div className="max-w-lg w-44 py-0.5">
              <Skeleton className="h-4" />
            </div>
          </div>
        )}
        <div className="flex flex-wrap p-4">
          <div className="w-full md:w-1/4 mb-2 md:mb-0">
            {/* {t ? t('blocks:block.height') : 'Block Height'} */}
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
            {/* {t ? t('blocks:block.hash') : 'Hash'} */}
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
            {/* {t ? t('blocks:block.timestamp') : 'Timestamp'} */}
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
            {/* {t ? t('blocks:block.transactions.0') : 'Transactions'} */}
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
};

export default Detail;
