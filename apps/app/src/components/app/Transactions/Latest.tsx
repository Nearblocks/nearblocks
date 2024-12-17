'use client';
import { useTranslations } from 'next-intl';
import React from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

import { Link } from '@/i18n/routing';
import {
  getTimeAgoString,
  nanoToMilli,
  shortenAddress,
  shortenHex,
  yoctoToNear,
} from '@/utils/libs';
import { TransactionInfo } from '@/utils/types';

import Tooltip from '../common/Tooltip';
import Skeleton from '../skeleton/common/Skeleton';

interface Props {
  error: boolean;
  txns: TransactionInfo[];
}

const LatestTransactions = ({ error, txns }: Props) => {
  const t = useTranslations();

  return (
    <>
      <div className="relative">
        <PerfectScrollbar>
          {!txns && error && (
            <div className="flex items-center h-16 mx-3 py-2 text-nearblue-700 text-xs">
              {t ? t('homePage.error') : ' Error!'}
            </div>
          )}
          {!error && txns?.length === 0 && (
            <div className="flex items-center h-16 mx-3 py-2 text-nearblue-700 text-xs">
              {t ? t('homePage.noTxns') : ' No transactions found!'}
            </div>
          )}
          {error && txns?.length === 0 && (
            <div className="px-3 dark:divide-black-200 divide-y h-80">
              {[...Array(5)].map((_, i) => (
                <div
                  className="grid grid-cols-2 md:grid-cols-3 gap-3 py-3"
                  key={i}
                >
                  <div className="flex items-center ">
                    <div className="flex-shrink-0 rounded-full h-10 w-10 bg-blue-900/10 dark:text-neargray-10 flex items-center justify-center text-sm">
                      TX
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
          {txns?.length > 0 && (
            <div className="px-3 divide-y dark:divide-black-200 h-80">
              {txns?.map((txn: TransactionInfo) => {
                return (
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3 py-3"
                    key={txn?.transaction_hash}
                  >
                    <div className=" flex items-center">
                      <div className="flex-shrink-0 rounded-full h-10 w-10 bg-blue-900/10 flex items-center justify-center text-sm dark:text-white">
                        TX
                      </div>
                      <div className="overflow-hidden pl-2">
                        <div className="text-green-500 dark:text-green-250 text-sm">
                          <Link
                            className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                            href={`/txns/${txn?.transaction_hash}`}
                          >
                            {shortenHex(txn?.transaction_hash ?? '')}
                          </Link>
                        </div>
                        <div
                          className="text-gray-400 text-xs truncate"
                          suppressHydrationWarning
                        >
                          {txn?.block_timestamp
                            ? getTimeAgoString(
                                nanoToMilli(txn?.block_timestamp),
                              )
                            : ''}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 px-2 order-2 md:order-1 text-sm">
                      <div className="whitespace-nowrap truncate dark:text-white">
                        {t ? t('homePage.txnFrom') : 'From'}{' '}
                        <Link
                          className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                          href={`/address/${txn?.signer_account_id}`}
                        >
                          {shortenAddress(txn?.signer_account_id ?? '')}
                        </Link>
                      </div>
                      <div className="whitespace-nowrap truncate dark:text-white">
                        {t ? t('homePage.txnTo') : 'To'}{' '}
                        <Link
                          className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                          href={`/address/${txn?.receiver_account_id}`}
                        >
                          {shortenAddress(txn?.receiver_account_id ?? '')}
                        </Link>
                      </div>
                    </div>
                    <div className="text-right order-1 md:order-2 overflow-hidden">
                      <Tooltip
                        className={'top-4 whitespace-nowrap max-w-[200px]'}
                        position="left"
                        tooltip={'Deposit value'}
                      >
                        <span className="u-label--badge-in  text-nearblue-700 truncate">
                          {txn?.actions_agg?.deposit
                            ? yoctoToNear(txn?.actions_agg?.deposit, true)
                            : txn?.actions_agg?.deposit ?? ''}{' '}
                          Ⓝ
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
      {error && txns.length === 0 && (
        <div className="border-t dark:border-black-200 px-2 py-3 text-nearblue-600">
          <Skeleton className="h-10" />
        </div>
      )}
      {txns && txns?.length > 0 && (
        <div className="border-t dark:border-black-200 px-2 py-3 text-nearblue-600">
          <Link
            className="block text-center dark:text-white  border border-green-900/10 font-thin dark:font-normal bg-green-500 dark:hover:text-green-250 dark:bg-black-600/[0.75] hover:bg-green-400 text-white text-xs dark:text-sm py-3 rounded w-full focus:outline-none hover:no-underline"
            href="/txns"
          >
            View all transactions
          </Link>
        </div>
      )}
    </>
  );
};

export default LatestTransactions;
