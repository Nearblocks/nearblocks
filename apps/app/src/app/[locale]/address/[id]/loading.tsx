'use client';
import classNames from 'classnames';
import { useSearchParams } from 'next/navigation';
import BalanceSkeleton from '@/components/app/skeleton/address/balance';
import TabPanelGeneralSkeleton from '@/components/app/skeleton/address/dynamicTab';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const tabs = [
  { name: 'txns', message: 'Transactions', label: 'Transactions' },
  { name: 'receipts', message: 'Receipts', label: 'Receipts' },
  { name: 'tokentxns', message: 'tokenTxns', label: 'Token Txns' },
  { name: 'nfttokentxns', message: 'nftTokenTxns', label: 'NFT Token Txns' },
  { name: 'accesskeys', message: 'accessKeys', label: 'Access Keys' },
  { name: 'contract', message: 'contract', label: 'Contract' },
];
export default function AddressLoading() {
  const t = useTranslations();
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
    <>
      <BalanceSkeleton />
      <div className="py-6"></div>
      <div className="block lg:flex lg:space-x-2 mb-10">
        <div className="w-full ">
          <div className="flex flex-wrap ">
            {tabs?.map(({ name, label, message }: any) => {
              return (
                <Link
                  key={name}
                  href={`#`}
                  className={getClassName(name === tab)}
                >
                  <h2>{t(`${message}`) || label}</h2>
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
