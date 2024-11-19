'use client';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import BalanceSkeleton from '@/components/app/skeleton/address/balance';
import TabPanelGeneralSkeleton from '@/components/app/skeleton/address/dynamicTab';
import { Link } from '@/i18n/routing';

export default function AddressLoading() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

  const tabs = [
    { label: 'Transactions', message: 'Transactions', name: 'txns' },
    { label: 'Receipts', message: 'Receipts', name: 'receipts' },
    { label: 'Token Txns', message: t('tokenTxns'), name: 'tokentxns' },
    {
      label: 'NFT Token Txns',
      message: t('nftTokenTxns'),
      name: 'nfttokentxns',
    },
    { label: 'Access Keys', message: t('accessKeys'), name: 'accesskeys' },
  ];

  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'bg-green-600 dark:bg-green-250 text-white': selected,
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
      },
    );
  return (
    <>
      <BalanceSkeleton />
      <div className="py-6"></div>
      <div className="block lg:flex lg:space-x-2 mb-10">
        <div className="w-full ">
          <div className="flex flex-wrap ">
            {tabs?.map(({ message, name }: any) => {
              return (
                <Link
                  className={getClassName(name === tab)}
                  href={`#`}
                  key={name}
                >
                  <h2>{message}</h2>
                </Link>
              );
            })}
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

            {tab === 'accesskeys' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}
          </div>
        </div>
      </div>
      <div className="mb-10"></div>
    </>
  );
}
