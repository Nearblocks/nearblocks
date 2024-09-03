'use client';

import Skeleton from '@/components/app/_components/skeleton/common/Skeleton';
import classNames from 'classnames';
import { useSearchParams } from 'next/navigation';
import BalanceSkeleton from '@/components/app/_components/skeleton/address/balance';
import Link from 'next/link';
import TabPanelGeneralSkeleton from '@/components/app/_components/skeleton/address/dynamicTab';

const tabs = [
  { name: 'txns', label: 'Transactions' },
  { name: 'tokentxns', label: 'Token Txns' },
  { name: 'nfttokentxns', label: 'NFT Token Txns' },
  { name: 'accesskeys', label: 'Access Keys' },
];
// Simulated absence of the translation function
const t = (key: string): string | undefined => {
  const simulateAbsence = true; // Set to true to simulate absence of t
  return simulateAbsence ? undefined : key; // Return undefined to simulate absence
};
export default function AddressLoading() {
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

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
            <Skeleton className="h-7" />
          </div>
        </div>
      </div>

      <BalanceSkeleton />

      <div className="py-6"></div>
      <div className="block lg:flex lg:space-x-2 mb-10">
        <div className="w-full ">
          <div className="flex flex-wrap ">
            {tabs?.map(({ name, label }: any) => {
              return (
                <Link
                  key={name}
                  href={`#`}
                  className={getClassName(name === tab)}
                >
                  <h2>{t(`address:${name}`) || label}</h2>
                </Link>
              );
            })}
          </div>
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
            {!tab || tab === 'txns' ? (
              <TabPanelGeneralSkeleton tab={tab || 'txns'} />
            ) : null}

            {tab === 'tokentxns' ? <TabPanelGeneralSkeleton tab={tab} /> : null}

            {tab === 'nfttokentxns' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}

            {tab === 'accesskeys' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}
          </div>
        </div>
      </div>
      <div className="mb-10"></div>
    </div>
  );
}
