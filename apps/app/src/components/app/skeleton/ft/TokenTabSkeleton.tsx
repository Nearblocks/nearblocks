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
const TokenTabSkeleton = forwardRef(
  ({ error, pageTab }: Props, ref: Ref<HTMLDivElement>) => {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const tab = searchParams?.get('tab') || 'transfers';

    const getClassName = (selected: boolean) =>
      classNames(
        'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
        {
          'bg-green-600 dark:bg-green-250 text-white': selected,
          'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
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
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-80 max-w-xs py-4 bg-neargray-25 dark:bg-black-300">
            {!error ? <Skeleton className="h-6 flex mt-2" /> : ''}
          </div>
        </div>
        <div>
          {!error ? (
            <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2 md:mb-2">
              <div className="w-full">
                <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
                  <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                    Overview
                  </h2>

                  <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                    <div className="flex divide-x dark:divide-black-200 my-2">
                      <div className="flex-col flex-1 flex-wrap py-1">
                        <div className="w-full text-gray-400 text-xs uppercase mb-1  text-[80%]">
                          Price
                        </div>

                        <div className="w-20">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                      <div className="flex-col flex-1 flex-wrap py-2 px-3">
                        <div className="w-full text-gray-400 text-xs uppercase mb-1 flex  text-[80%]">
                          FULLY DILUTED MARKET CAP
                          <span>
                            <svg
                              className="w-4 h-4 fill-current ml-1"
                              height={16}
                              viewBox="0 0 24 24"
                              width={16}
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M0 0h24v24H0z" fill="none" />
                              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 011-1 1.5 1.5 0 10-1.471-1.794l-1.962-.393A3.501 3.501 0 1113 13.355z" />
                            </svg>
                          </span>
                        </div>

                        <div className="w-20">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap py-4">
                      <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                        Max Total Supply:
                      </div>

                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                    <div className="flex flex-wrap py-4">
                      <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                        Transfers:
                      </div>

                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                    <div className="flex flex-wrap py-4">
                      <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                        Holders:
                      </div>

                      <div className="w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
                  <h2 className="border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
                    Profile Summary
                  </h2>
                  <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
                    <div className="flex flex-wrap items-center justify-between py-4">
                      <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                        Contract:
                      </div>

                      <div className="w-full md:w-3/4 break-words">
                        <div className="w-32">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between py-4">
                      <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                        Decimals:
                      </div>
                      <div className="w-full md:w-3/4 break-words">
                        <div className="w-32">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between py-4">
                      <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                        Official Site:
                      </div>
                      <div className="w-full md:w-3/4 text-green-500 break-words">
                        <div className="w-32">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between py-4">
                      <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                        Social Profiles:
                      </div>
                      <div className="w-full md:w-3/4 break-words">
                        <div className="w-32">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="bg-white soft-shadow rounded-xl dark:bg-black-600">
                <ErrorMessage
                  icons={<FaInbox />}
                  message={''}
                  mutedText="Please try again later"
                  reset
                />
              </div>
            </div>
          )}
          <div className="py-6"></div>
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
        </div>
        <div className="py-8"></div>
      </>
    );
  },
);
TokenTabSkeleton.displayName = 'Overview';
export default TokenTabSkeleton;
