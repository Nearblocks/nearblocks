'use client';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import TabPanelGeneralSkeleton from '@/components/app/skeleton/address/dynamicTab';
import { Link } from '@/i18n/routing';

export default function TabSkeletion() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

  const tabs = [
    { label: 'Transactions', message: 'Transactions', name: 'txns' },
    { label: 'Receipts', message: 'Receipts', name: 'receipts' },
    { label: 'Token Txns', message: 'tokenTxns', name: 'tokentxns' },
    { label: 'NFT Token Txns', message: 'nftTokenTxns', name: 'nfttokentxns' },
    {
      label: 'Multichain Transactions',
      message: 'multichainTxns',
      name: 'multichaintxns',
    },
    { label: 'Access Keys', message: 'accessKeys', name: 'accesskeys' },
    { label: 'Contract', message: 'contract', name: 'contract' },
  ];

  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium inline-block whitespace-nowrap cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'bg-green-600 dark:bg-green-250 text-white': selected,
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
      },
    );
  return (
    <>
      <div className="block lg:flex lg:space-x-2 mb-10">
        <div className="w-full ">
          <div className="w-full ">
            <div className="flex overflow-x-auto min-w-full min-h-fit">
              {tabs?.map(({ label, message, name }: any) => {
                return (
                  <Link
                    className={getClassName(name === tab)}
                    href={`#`}
                    key={name}
                  >
                    <h2>{t(`${message}`) || label}</h2>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
            {!tab || tab === 'txns' ? (
              <TabPanelGeneralSkeleton tab={tab || 'txns'} />
            ) : null}
            {!tab || tab === 'receipts' ? (
              <TabPanelGeneralSkeleton tab={tab || 'receipts'} />
            ) : null}

            {tab === 'tokentxns' ? <TabPanelGeneralSkeleton tab={tab} /> : null}

            {tab === 'nfttokentxns' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}
            {tab === 'multichaintxns' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}
            {tab === 'accesskeys' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}
            {tab === 'contract' ? (
              <TabPanelGeneralSkeleton tab={'contract'} />
            ) : null}
          </div>
        </div>
      </div>
      <div className="mb-10"></div>
    </>
  );
}
