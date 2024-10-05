'use client';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
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
const t = (key: string): string | undefined => {
  const simulateAbsence = true;
  return simulateAbsence ? undefined : key;
};
export default function TabSkeleton() {
  const searchParams = useSearchParams();
  const [tabIndex, setTabIndex] = useState(0);
  const tab = searchParams?.get('tab');

  useEffect(() => {
    const currentIndex = tabs.indexOf(tab || '');

    setTabIndex(currentIndex !== -1 ? currentIndex : 0);
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
