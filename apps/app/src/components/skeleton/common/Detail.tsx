import { useTranslations } from 'next-intl';
import React, { forwardRef, Ref } from 'react';

import Execution from '../txns/Execution';
import Summary from '../txns/Summary';
import Tree from '../txns/Tree';
import Comment from './Comment';
import Skeleton from './Skeleton';
interface Props {
  className?: string;
  network: string;
  pageTab?: string;
  txns?: boolean;
}
const Detail = forwardRef(
  ({ className, network, pageTab, txns }: Props, ref: Ref<HTMLDivElement>) => {
    const t = useTranslations();

    const buttonStyles = (hash: string) =>
      `relative text-nearblue-600  text-xs leading-4 font-medium inline-block cursor-pointer mb-3 mr-[0.95rem] focus:outline-none ${
        pageTab === hash
          ? 'rounded-lg bg-green-600 dark:bg-green-250 text-white'
          : 'hover:bg-neargray-800 bg-neargray-700 dark:text-neargray-10 dark:bg-black-200 rounded-lg hover:text-nearblue-600'
      }`;

    return (
      <div className={`w-full z-10 ${className} pr-2 mr-3.5`} ref={ref}>
        {!txns && (
          <div className="md:flex items-center justify-between">
            <div className="w-80 max-w-xs px-3 py-5">
              <Skeleton className="h-7" />
            </div>
          </div>
        )}
        {txns === true && (
          <div className="mr-3.5">
            <div className={buttonStyles('overview')}>
              <h2 className="p-2">{t ? t('txn.tabs.overview') : 'Overview'}</h2>
            </div>
            <div className={buttonStyles('execution')}>
              <h2 className="p-2">
                {t ? t('txn.tabs.execution') : 'Execution Plan'}
              </h2>
            </div>
            <div className={buttonStyles('enhanced')}>
              <h2 className="p-2">{'Enhanced Plan'}</h2>
              <div className="absolute text-white bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md -top-1.5 -right-1.5 px-1">
                NEW
              </div>
            </div>
            <div className={buttonStyles('tree')}>
              <h2 className="p-2">Tree Plan</h2>
            </div>
            <div className={buttonStyles('summary')}>
              <h2 className="p-2">Receipt Summary</h2>
            </div>
            <div className={buttonStyles('comments')}>
              <h2 className="p-2">{t ? t('txn.tabs.comments') : 'Comments'}</h2>
            </div>
          </div>
        )}
        <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 divide-solid dark:divide-black-200  divide-gray-200 divide-y soft-shadow rounded-xl mr-4">
          {pageTab === 'summary' ? (
            <Summary />
          ) : pageTab === 'enhanced' ? (
            <Execution />
          ) : pageTab === 'tree' ? (
            <Tree />
          ) : pageTab === 'comments' ? (
            <Comment />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    );
  },
);
Detail.displayName = 'Detail';
export default Detail;
