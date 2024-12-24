'use client';

import { useTranslations } from 'next-intl';
import React from 'react';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import TableSummary from '@/components/app/common/TableSummary';
import FaInbox from '@/components/app/Icons/FaInbox';

export default function Error({ error, reset }: any) {
  const t = useTranslations();
  React.useEffect(() => {
    console.log('logging error:', error);
  }, [error]);

  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-white text-lg font-medium">
            {t ? t('nfts.heading') : 'Non-Fungible Token Transfers'}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full">
            <TableSummary text="" />
            <div className="overflow-x-auto">
              <div className="bg-white dark:bg-black-600 drak:border-black-200 border soft-shadow rounded-xl pb-1 ">
                <div className="pl-6 max-w-lg w-full py-5 ">
                  <div className="pl-6 max-w-sm leading-7 h-4" />
                </div>
                <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
                  <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
                    <tr className="h-[57px]">
                      <td
                        className="px-6 py-4 text-gray-400 text-xs rounded-b-xl"
                        colSpan={100}
                      >
                        <ErrorMessage
                          icons={<FaInbox />}
                          message={''}
                          mutedText="Please try again later"
                          reset={reset}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
