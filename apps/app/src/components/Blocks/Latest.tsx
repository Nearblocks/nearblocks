import React from 'react';
import Link from 'next/link';
import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import useTranslation from 'next-translate/useTranslation';
import { useFetch } from '@/hooks/useFetch';
import Skeleton from '../skeleton/common/Skeleton';
import { BlocksInfo } from '@/utils/types';
import {
  convertToMetricPrefix,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
} from '@/utils/libs';
import { Tooltip } from '@reach/tooltip';

const LatestBlocks = () => {
  const { t } = useTranslation();
  const { data, error, loading } = useFetch('blocks/latest', {
    refreshInterval: 60000,
    revalidateOnReconnect: true,
  });

  const blocks = data?.blocks || [];

  return (
    <>
      <div className="relative">
        <PerfectScrollbar>
          {!blocks && error && (
            <div className="flex items-center h-16 mx-3 py-2 text-nearblue-700 text-xs">
              {t ? t('home:error') : 'Error!'}
            </div>
          )}
          {!error && !loading && blocks?.length === 0 && (
            <div className="flex items-center h-16 mx-3 py-2 text-nearblue-700 text-xs">
              {t ? t('home:noBlocks') : 'No blocks found'}
            </div>
          )}
          {loading && blocks?.length === 0 && (
            <div className="px-3 divide-y dark:divide-black-200 h-80">
              {[...Array(5)].map((_, i) => (
                <div
                  className="grid grid-cols-2 md:grid-cols-3 gap-3 py-3"
                  key={i}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-xl h-10 w-10 bg-blue-900/10 dark:text-white flex items-center justify-center text-sm">
                      BK
                    </div>
                    <div className="px-2">
                      <div className="text-green-500 dark:text-green-250 text-sm">
                        <div className="h-5 w-14">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                      <div className="text-nearblue-700 text-xs">
                        <div className="h-4 w-24">
                          <Skeleton className="h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1 px-2 order-2 md:order-1 text-sm">
                    <div className="h-5 w-36">
                      <Skeleton className="h-4" />
                    </div>
                    <div className="text-nearblue-700 text-sm">
                      <div className="h-5 w-14">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right order-1 md:order-2">
                    <div className="ml-auto w-32">
                      <Skeleton className="h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {blocks?.length > 0 && (
            <div className="px-3 divide-y dark:divide-black-200 h-80">
              {blocks?.map((block: BlocksInfo) => {
                return (
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3 py-3"
                    key={block?.block_hash}
                  >
                    <div className=" flex items-center">
                      <div className="flex-shrink-0 rounded-xl h-10 w-10 bg-blue-900/10 dark:text-white  flex items-center justify-center text-sm">
                        BK
                      </div>
                      <div className="overflow-hidden pl-2">
                        <div className="text-green-500 dark:text-green-250 text-sm font-medium ">
                          <Link
                            href={`/blocks/${block?.block_hash}`}
                            className="text-green-500 dark:text-green-250 hover:no-underline"
                          >
                            {block?.block_height
                              ? localFormat(block?.block_height)
                              : block?.block_height ?? ''}
                          </Link>
                        </div>
                        <div className="text-nearblue-700 text-xs truncate">
                          {block?.block_timestamp
                            ? getTimeAgoString(
                                nanoToMilli(block?.block_timestamp),
                              )
                            : ''}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 px-2 order-2 md:order-1  text-sm whitespace-nowrap dark:text-green-250 truncate">
                      <span className="dark:text-white">
                        {t ? t('home:blockMiner') : 'Author'}&nbsp;
                      </span>
                      <Link
                        href={`/address/${block?.author_account_id}`}
                        className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                      >
                        {block?.author_account_id}
                      </Link>
                      <div className="text-nearblue-700 text-sm ">
                        {block?.transactions_agg?.count
                          ? localFormat(block?.transactions_agg?.count)
                          : block?.transactions_agg?.count ?? ''}{' '}
                        txns{' '}
                      </div>
                    </div>
                    <div className="text-right order-1 md:order-2 overflow-hidden">
                      <Tooltip
                        label="Gas used"
                        className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
                      >
                        <span className="u-label--badge-in text-nearblue-700 truncate">
                          {block?.chunks_agg?.gas_used
                            ? convertToMetricPrefix(
                                block?.chunks_agg?.gas_used,
                              ) + 'gas'
                            : block?.chunks_agg?.gas_used ?? '' + 'gas'}
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PerfectScrollbar>
      </div>
      {loading && blocks?.length === 0 && (
        <div className="border-t dark:border-black-200 px-2 py-3 text-nearblue-600">
          <Skeleton className="h-10" />
        </div>
      )}
      {blocks && blocks?.length > 0 && (
        <div className="border-t dark:border-black-200 px-2 py-3 text-nearblue-600">
          <Link
            href="/blocks"
            className="block  dark:text-white text-center border border-green-900/10 bg-green-500 dark:bg-black-600/[0.75] hover:bg-green-400 font-thin dark:font-normal dark:hover:text-green-250 text-white dark:text-sm text-xs py-3 rounded w-full focus:outline-none hover:no-underline"
          >
            View all blocks
          </Link>
        </div>
      )}
    </>
  );
};

export default LatestBlocks;
