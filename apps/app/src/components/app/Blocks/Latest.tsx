'use client';
import { useTranslations } from 'next-intl';
import React from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

import { Link } from '@/i18n/routing';
import {
  convertToMetricPrefix,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
} from '@/utils/libs';
import { BlocksInfo } from '@/utils/types';

import Tooltip from '../common/Tooltip';
import Skeleton from '../skeleton/common/Skeleton';

interface Props {
  blocks: BlocksInfo[];
  error: boolean;
}

const LatestBlocks = ({ blocks, error }: Props) => {
  const t = useTranslations();

  return (
    <>
      <div className="relative">
        <PerfectScrollbar>
          {!blocks && error && (
            <div className="flex items-center h-16 mx-3 py-2 text-nearblue-700 text-xs">
              {t ? t('homePage.error') : 'Error!'}
            </div>
          )}
          {!error && blocks?.length === 0 && (
            <div className="flex items-center h-16 mx-3 py-2 text-nearblue-700 text-xs">
              {t ? t('homePage.noBlocks') : 'No blocks found'}
            </div>
          )}
          {error && blocks?.length === 0 && (
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
                            className="text-green-500 dark:text-green-250 hover:no-underline font-semibold"
                            href={`/blocks/${block?.block_hash}`}
                          >
                            {block?.block_height
                              ? localFormat(block?.block_height)
                              : block?.block_height ?? ''}
                          </Link>
                        </div>
                        <div
                          className="text-nearblue-700 text-xs truncate"
                          suppressHydrationWarning
                        >
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
                        {t ? t('homePage.blockMiner') : 'Author'}&nbsp;
                      </span>
                      <Link
                        className="text-green-500 dark:text-green-250 font-semibold hover:no-underline"
                        href={`/address/${block?.author_account_id}`}
                      >
                        <span>{block?.author_account_id}</span>
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
                        className={'top-4 whitespace-nowrap max-w-[200px]'}
                        position="left"
                        tooltip="Gas used"
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
      {error && blocks?.length === 0 && (
        <div className="border-t dark:border-black-200 px-2 py-3 text-nearblue-600">
          <Skeleton className="h-10" />
        </div>
      )}
      {blocks && blocks?.length > 0 && (
        <div className="border-t dark:border-black-200 px-2 py-3 text-nearblue-600">
          <Link href="/blocks">
            <span className="block  dark:text-white text-center border border-green-900/10 bg-green-500 dark:bg-black-600/[0.75] hover:bg-green-400 font-semibold dark:font-semibold dark:hover:text-green-250 text-white dark:text-sm text-sm py-2 rounded w-full focus:outline-none hover:no-underline cursor-pointer">
              View all blocks
            </span>
          </Link>
        </div>
      )}
    </>
  );
};

export default LatestBlocks;
