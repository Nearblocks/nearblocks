'use client';
import FaExternalLinkAlt from '@/app/_components/Icons/FaExternalLinkAlt';
import AccessKeyTabSkeleton from '@/app/_components/skeleton/address/accessKeyTab';
import NftTokenTxnsSkeleton from '@/app/_components/skeleton/address/nftTokenTxns';
import TokenTxnsSkeleton from '@/app/_components/skeleton/address/tokenTransaction';
import TransactionSkeleton from '@/app/_components/skeleton/address/transaction';
import Skeleton from '@/app/_components/skeleton/common/Skeleton';
import { networkId } from '@/app/utils/config';
import classNames from 'classnames';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
const tabs = [
  'txns',
  'tokentxns',
  'nfttokentxns',
  'accesskeys',
  'contract',
  'comments',
];
// Simulated absence of the translation function
const t = (key: string): string | undefined => {
  const simulateAbsence = true; // Set to true to simulate absence of t
  return simulateAbsence ? undefined : key; // Return undefined to simulate absence
};
export default function AddressLoading() {
  const searchParams = useSearchParams();
  const [tabIndex, setTabIndex] = useState(0);
  const tab = searchParams?.get('tab');

  useEffect(() => {
    // Get the index of the current tab in the tabs array
    const currentIndex = tabs.indexOf(tab || '');

    // Set the tabIndex state to the found index
    setTabIndex(currentIndex !== -1 ? currentIndex : 0); // Fallback to 0 if tab is not found
  }, [tab]);
  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
        'bg-green-600 dark:bg-green-250 text-white': selected,
      },
    );
  return (
    <div className="relative container mx-auto px-3">
      <div className="flex items-center justify-between flex-wrap pt-4">
        <div className="w-80 max-w-xs px-3 py-5">
          <Skeleton className="h-7" />
        </div>
        <div className="container mx-auto pl-2 pb-6 text-nearblue-600">
          <div className="min-h-[80px] md:min-h-[25px]">
            {/* <SponserdText /> */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full">
          <div className="h-full bg-white soft-shadow rounded-xl dark:bg-black-600">
            <div className="flex justify-between border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10">
              <h2 className="leading-6 text-sm font-semibold">
                {t('address:overview') || 'Overview'}
              </h2>

              <div className="flex items-center text-xs bg-gray-100 dark:bg-black-200 dark:text-neargray-10 rounded-md px-2 py-1">
                <div className="truncate max-w-[110px]">token name</div>

                <a
                  href={''}
                  className="ml-1"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <FaExternalLinkAlt />
                </a>
              </div>
            </div>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="flex flex-wrap py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t('address:balance') || 'Balance'}:
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
              {networkId === 'mainnet' && (
                <div className="flex flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    {t('address:value') || 'Value:'}
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
              )}
              <div className="flex flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t('address:tokens') || 'Tokens:'}
                </div>
                <div className="w-full md:w-3/4 break-words -my-1 z-10">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
            <h2 className="leading-6 border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
              {t('address:moreInfo') || 'Account information'}
            </h2>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="flex justify-between">
                <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                  <div className="w-full mb-2 md:mb-0">
                    Staked {t('address:balance') || 'Balance'}:
                  </div>
                  <div className="w-full break-words">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex ml-4  xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                  <div className="w-full mb-2 md:mb-0">
                    {t('address:storageUsed') || 'Storage Used'}:
                  </div>
                  <div className="w-full break-words">
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  Contract Creator:
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  Token Tracker:
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <div className="flex items-center">
                    <span className="w-full h-full flex items-center justify-center relative">
                      <span className="absolute inset-0 bg-white">
                        <span className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-black-200 rounded" />
                      </span>
                    </span>
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  NFT Token Tracker:
                </div>
                <div className="w-full md:w-3/4 break-words">
                  <div className="flex items-center">
                    <span className="w-full h-full flex items-center justify-center relative">
                      <span className="absolute inset-0 bg-white">
                        <span className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-black-200 rounded" />
                      </span>
                    </span>
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-6"></div>
      <div className="block lg:flex lg:space-x-2 mb-10">
        <div className="w-full ">
          <>
            <div>
              <Tabs selectedIndex={tabIndex}>
                <TabList className="flex flex-wrap">
                  {[
                    { key: 0, label: t('address:txns') || 'Transactions' },
                    {
                      key: 1,
                      label: t('address:tokenTxns') || 'Token Txns',
                    },
                    {
                      key: 2,
                      label: t('address:nftTokenTxns') || 'NFT Token Txns',
                    },
                    {
                      key: 3,
                      label: t('address:accessKeys') || 'Access Keys',
                    },
                    // {
                    //   key: 4,
                    //   label: (
                    //     <div className="flex h-full">
                    //       <h2>Contract</h2>
                    //       <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md ml-11 -mt-3 px-1">
                    //         NEW
                    //       </div>
                    //     </div>
                    //   ),
                    // },
                  ].map(({ key, label }) => (
                    <Tab
                      disabled
                      key={key}
                      className={getClassName(tabs[key] === tabs[tabIndex])}
                      selectedClassName="rounded-lg bg-green-600 dark:bg-green-250 text-white"
                    >
                      <h2>{label}</h2>
                    </Tab>
                  ))}
                </TabList>
                <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
                  <TabPanel>
                    <TransactionSkeleton />
                  </TabPanel>
                  <TabPanel>
                    <TokenTxnsSkeleton />
                  </TabPanel>
                  <TabPanel>
                    <NftTokenTxnsSkeleton />
                  </TabPanel>
                  <TabPanel>
                    <AccessKeyTabSkeleton />
                  </TabPanel>
                  {/* <TabPanel>
                    <OverviewActionsSkeleton />
                  </TabPanel> */}
                </div>
              </Tabs>
            </div>
          </>
        </div>
      </div>
      <div className="mb-10">
        {/* {
      <Widget
        src={`${ownerId}/widget/includes.Common.Banner`}
        props={{ type: 'center', userApiUrl: userApiUrl }}
      />
    } */}
      </div>
    </div>
  );
}
