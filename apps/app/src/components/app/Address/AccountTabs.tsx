import classNames from 'classnames';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import AccessKeys from '@/components/app/Address/AccessKeys';
import Overview from '@/components/app/Address/Contract/Overview';
import NFTTransactions from '@/components/app/Address/NFTTransactions';
import Receipts from '@/components/app/Address/Receipts';
import TokenTransactions from '@/components/app/Address/TokenTransactions';
import Transactions from '@/components/app/Address/Transactions';
import TabPanelGeneralSkeleton from '@/components/app/skeleton/address/dynamicTab';
import { Link } from '@/i18n/routing';
import { getRequest } from '@/utils/app/api';

import MultiChainTransactions from './ChainTxns';

export default async function AccountTabs({
  id,
  locale,
  searchParams,
}: {
  id: string;
  locale: string;
  searchParams: any;
}) {
  const t = await getTranslations({ locale });
  const parse = (await getRequest(`account/${id}/contract/parse`)) || {};
  const tab = searchParams?.tab || 'txns';

  const tabs = [
    { label: 'Transactions', message: 'Transactions', name: 'txns' },
    { label: 'Receipts', message: 'Receipts', name: 'receipts' },
    { label: 'Token Txns', message: t('tokenTxns'), name: 'tokentxns' },
    {
      label: 'NFT Token Txns',
      message: t('nftTokenTxns'),
      name: 'nfttokentxns',
    },
    {
      label: 'Multichain Transactions',
      message: t('multi-chainTxns'),
      name: 'multichaintxns',
    },
    { label: 'Access Keys', message: t('accessKeys'), name: 'accesskeys' },
    { label: 'Contract', message: t('contract'), name: 'contract' },
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
    <div className="block lg:flex lg:space-x-2 mb-10 mt-5">
      <div className=" w-full">
        <div className="flex overflow-x-auto min-w-full min-h-fit pt-2">
          {tabs?.map(({ message, name }) => {
            const hasContractTab =
              parse?.contract?.[0]?.contract &&
              Array.isArray(parse?.contract?.[0]?.contract?.methodNames) &&
              parse.contract[0].contract.methodNames.length > 0;

            if (!hasContractTab && name === 'contract') return null;

            return (
              <Link
                className={getClassName(name === tab)}
                href={
                  name === 'txns'
                    ? `/address/${id}`
                    : `/address/${id}?tab=${name}`
                }
                key={name}
                scroll={false}
              >
                <h2 className="relative">
                  {message}
                  {name === 'contract' && (
                    <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md  -mt-3 px-1">
                      NEW
                    </div>
                  )}
                </h2>
              </Link>
            );
          })}
        </div>
        <div
          className={`${
            tab !== 'multichaintxns'
              ? 'bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full'
              : ''
          }`}
        >
          <Suspense fallback={<TabPanelGeneralSkeleton tab={tab} />}>
            {tab === 'txns' ? (
              <Transactions id={id} searchParams={searchParams} />
            ) : null}

            {tab === 'receipts' ? (
              <Receipts id={id} searchParams={searchParams} />
            ) : null}

            {tab === 'tokentxns' ? (
              <TokenTransactions id={id} searchParams={searchParams} />
            ) : null}

            {tab === 'nfttokentxns' ? (
              <NFTTransactions id={id} searchParams={searchParams} />
            ) : null}

            {tab === 'multichaintxns' ? (
              <MultiChainTransactions id={id} searchParams={searchParams} />
            ) : null}

            {tab === 'accesskeys' ? (
              <AccessKeys id={id} searchParams={searchParams} />
            ) : null}

            {tab === 'contract' ? (
              <Overview id={id} searchParams={searchParams} />
            ) : null}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
