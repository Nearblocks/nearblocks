'use client';
import Skeleton from '@/app/_components/skeleton/common/Skeleton';
import classNames from 'classnames';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import TableSkeleton from '../common/table';
import AccessKeyTabSkeleton from './accessKeyTab';
const tabs = [
  'txns',
  'tokentxns',
  'nfttokentxns',
  'accesskeys',
  'contract',
  'comments',
];
// Simulated absence of the translation function
const t = (key: string, p?: any): string | undefined => {
  p = {};
  const simulateAbsence = true; // Set to true to simulate absence of t
  return simulateAbsence ? undefined : key; // Return undefined to simulate absence
};
export default function TabSkeleton() {
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
                  <div className="pl-6 max-w-lg w-full py-5 ">
                    <Skeleton className="h-4" />
                  </div>
                  <TableSkeleton />
                </TabPanel>
                <TabPanel>
                  <div className="pl-6 max-w-lg w-full py-5 ">
                    <Skeleton className="h-4" />
                  </div>
                  <TableSkeleton />
                </TabPanel>
                <TabPanel>
                  <div className="pl-6 max-w-lg w-full py-5 ">
                    <Skeleton className="h-4" />
                  </div>
                  <TableSkeleton />
                </TabPanel>
                <TabPanel>
                  <AccessKeyTabSkeleton />
                </TabPanel>
              </div>
            </Tabs>
          </div>
        </>
      </div>
    </div>
  );
}
