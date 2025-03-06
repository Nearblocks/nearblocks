'use client';
import classNames from 'classnames';
import { useParams, useSearchParams } from 'next/navigation';
import React, { forwardRef, Ref } from 'react';

import { Link } from '@/i18n/routing';

import ErrorMessage from '../../common/ErrorMessage';
import FaInbox from '../../Icons/FaInbox';
import Skeleton from '../common/Skeleton';
import FAQ from './FAQ';
import Info from './Info';
interface Props {
  className?: string;
  error?: boolean;
  pageTab?: string;
}
const TokenOverviewSkeleton = forwardRef(
  ({ error, pageTab }: Props, ref: Ref<HTMLDivElement>) => {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const tab = searchParams?.get('tab') || 'transfers';

    const getClassName = (selected: boolean) =>
      classNames(
        'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
        {
          'bg-green-600 dark:bg-green-250 text-white': selected,
          'hover:bg-neargray-800 dark:hover:bg-black-100 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
            !selected,
        },
      );

    const tabs = [
      { label: 'Transfers', message: 'fts.ft.transfers', name: 'transfers' },
      { label: 'Holders', message: 'fts.ft.holders', name: 'holders' },
      { label: 'Info', message: 'fts.ft.info', name: 'info' },
      { label: 'FAQ', message: 'fts.ft.faq', name: 'faq' },
    ];
    return (
      <>
        <div className="block lg:flex lg:space-x-2 mb-4">
          <div className="w-full">
            <div className="flex flex-wrap ">
              {tabs?.map(({ label, name }) => {
                return (
                  <Link
                    className={getClassName(name === tab)}
                    href={
                      name === 'transfers'
                        ? `/token/${params?.id}`
                        : `/token/${params?.id}?tab=${name}`
                    }
                    key={name}
                  >
                    <h2>{label}</h2>
                  </Link>
                );
              })}
            </div>

            <div className="relative">
              <div
                className={`bg-white dark:bg-black-600 border dark:border-black-200 soft-shadow rounded-xl overflow-hidden`}
                ref={ref}
              >
                {pageTab === 'Info' ? (
                  <Info />
                ) : pageTab === 'FAQ' ? (
                  <FAQ />
                ) : (
                  <>
                    <div className=" flex flex-row items-center justify-between text-left text-sm  text-nearblue-600 dark:text-neargray-10 px-3 py-2">
                      <div className="max-w-lg pl-3 w-full py-3.5 ">
                        {!error ? <Skeleton className=" h-4" /> : ''}
                      </div>
                    </div>
                    <div className="overflow-x-auto ">
                      <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
                        {!error && (
                          <thead className="bg-gray-100 dark:bg-black-200 h-[51px]">
                            <tr>
                              <th
                                className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
                                scope="col"
                              >
                                <Skeleton className="h-4" />
                              </th>
                              <th
                                className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
                                scope="col"
                              >
                                <Skeleton className="h-4" />
                              </th>
                              <th
                                className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
                                scope="col"
                              >
                                <Skeleton className="h-4" />
                              </th>
                              <th
                                className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
                                scope="col"
                              >
                                <Skeleton className="h-4" />
                              </th>
                              <th
                                className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
                                scope="col"
                              >
                                <Skeleton className="h-4" />
                              </th>
                              <th
                                className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
                                scope="col"
                              >
                                <Skeleton className="h-4" />
                              </th>
                              <th
                                className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
                                scope="col"
                              >
                                <Skeleton className="h-4" />
                              </th>
                              <th
                                className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top"
                                scope="col"
                              >
                                <Skeleton className="h-4" />
                              </th>
                            </tr>
                          </thead>
                        )}
                        <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
                          {!error ? (
                            [...Array(25)].map((_, i) => (
                              <tr
                                className="hover:bg-blue-900/5 h-[53px]"
                                key={i}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top">
                                  <Skeleton className="h-4" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top">
                                  <Skeleton className="h-4" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top">
                                  <Skeleton className="h-4" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-tiny align-top">
                                  <Skeleton className="h-4" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top">
                                  <Skeleton className="h-4" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top">
                                  <Skeleton className="h-4" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top">
                                  <Skeleton className="h-4" />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top">
                                  <Skeleton className="h-4" />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <div className="w-full">
                              <ErrorMessage
                                icons={<FaInbox />}
                                message={''}
                                mutedText="Please try again later"
                                reset
                              />
                            </div>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {!error ? (
                      <div className="bg-white dark:bg-black-600 px-2 py-3 flex items-center justify-between border-t dark:border-black-200 md:px-4">
                        <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div></div>
                          <Skeleton className="w-64 h-4" />
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </>
    );
  },
);
TokenOverviewSkeleton.displayName = 'Overview';
export default TokenOverviewSkeleton;
