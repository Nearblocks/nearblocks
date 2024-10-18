import React, { Ref, forwardRef } from 'react';
import Skeleton from '../common/Skeleton';
import { Link } from '@/i18n/routing';
import classNames from 'classnames';
import TransferSkeleton from './NFTTransfers';
import InventorySkeleton from './NFTInventory';

interface Props {
  className?: string;
  tab: string;
  id: string;
}
const NFTTokenTabSkeletion = forwardRef(
  ({ className, tab, id }: Props, ref: Ref<HTMLDivElement>) => {
    const getClassName = (selected: boolean) =>
      classNames(
        'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
        {
          'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
            !selected,
          'bg-green-600 dark:bg-green-250 text-white': selected,
        },
      );

    const tabs = [
      { name: 'transfers', message: 'fts.ft.transfers', label: 'Transfers' },
      { name: 'holders', message: 'fts.ft.holders', label: 'Holders' },
      { name: 'inventory', message: 'fts.ft.info', label: 'Inventory' },
    ];
    return (
      <div ref={ref} className={`w-full z-50 ${className}`}>
        <div className="flex items-center justify-between flex-wrap pt-4">
          <div className="w-80 max-w-xs px-3 py-5 bg-neargray-25 dark:bg-black-300">
            <Skeleton className="h-6" />
          </div>{' '}
        </div>
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 -mb-0.5">
            <div className="w-full">
              <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
                <div className="flex justify-between border-b dark:border-black-200 p-3 text-gray-600">
                  <div className="py-.5 text-sm font-semibold">
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
                <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600">
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-5 w-28" />
                    </div>

                    <Skeleton className="h-4 w-40" />
                  </div>

                  <div className="flex flex-wrap py-5 text-sm text-gray-600">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-5 w-28" />
                    </div>

                    <Skeleton className="h-4 w-40" />
                  </div>

                  <div className="flex flex-wrap py-4 text-sm text-gray-600">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-3.5 w-28" />
                    </div>
                    <div className="w-full md:w-3/4 break-words">
                      <Skeleton className="h-3.5 w-40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
                <div className="flex justify-between border-b dark:border-black-200 p-3 text-gray-600">
                  <div className="py-.5 text-sm font-semibold">
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>

                <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600">
                  <div className="flex flex-wrap py-4">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-5 w-28" />
                    </div>

                    <Skeleton className="h-4 w-40" />
                  </div>

                  <div className="flex flex-wrap py-5 text-sm text-gray-600">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-5 w-28" />
                    </div>

                    <Skeleton className="h-4 w-40" />
                  </div>

                  <div className="flex flex-wrap py-4 text-sm text-gray-600">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      <Skeleton className="h-3.5 w-28" />
                    </div>
                    <div className="w-full md:w-3/4 break-words">
                      <Skeleton className="h-3.5 w-40" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="py-6"></div>
          <div className="block lg:flex lg:space-x-2 mb-4 sm:mt-0 -mt-0.5">
            <div className="w-full">
              <div className=" flex">
                {tabs?.map(({ name, label }) => {
                  return (
                    <Link
                      key={name}
                      href={
                        name === 'transfers'
                          ? `/nft-token/${id}`
                          : `/nft-token/${id}?tab=${name}`
                      }
                      className={getClassName(name === tab)}
                    >
                      <h2>{label}</h2>
                    </Link>
                  );
                })}
              </div>
              <div className="relative">
                <div
                  className={`bg-white dark:bg-black-600 border soft-shadow rounded-xl overflow-hidden`}
                >
                  {tab === 'transfers' ? <TransferSkeleton /> : null}
                  {tab === 'holders' ? <TransferSkeleton /> : null}
                  {tab === 'inventory' ? <InventorySkeleton /> : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </div>
    );
  },
);
NFTTokenTabSkeletion.displayName = 'Overview';
export default NFTTokenTabSkeletion;
