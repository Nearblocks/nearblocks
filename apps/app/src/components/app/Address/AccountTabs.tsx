import TabPanelGeneralSkeleton from '@/components/app/skeleton/address/dynamicTab';
import Transactions from '@/components/app/Address/Transactions';
import { Suspense } from 'react';
import TokenTransactions from '@/components/app/Address/TokenTransactions';
import NFTTransactions from '@/components/app/Address/NFTTransactions';
import AccessKeys from '@/components/app/Address/AccessKeys';
import Overview from '@/components/app/Address/Contract/Overview';
import Receipts from '@/components/app/Address/Receipts';
import classNames from 'classnames';
import { getRequest } from '@/utils/app/api';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

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
    { name: 'txns', message: 'Transactions', label: 'Transactions' },
    { name: 'receipts', message: 'Receipts', label: 'Receipts' },
    { name: 'tokentxns', message: 'tokenTxns', label: 'Token Txns' },
    { name: 'nfttokentxns', message: 'nftTokenTxns', label: 'NFT Token Txns' },
    { name: 'accesskeys', message: 'accessKeys', label: 'Access Keys' },
    { name: 'contract', message: 'contract', label: 'Contract' },
  ];
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
        <div className="flex flex-wrap ">
          {tabs?.map(({ name, label, message }) => {
            const hasContractTab =
              parse?.contract?.[0]?.contract &&
              Array.isArray(parse?.contract?.[0]?.contract?.methodNames) &&
              parse.contract[0].contract.methodNames.length > 0;

            if (!hasContractTab && name === 'contract') return null;

            return (
              <Link
                key={name}
                href={
                  name === 'txns'
                    ? `/address/${id}`
                    : `/address/${id}?tab=${name}`
                }
                className={getClassName(name === tab)}
              >
                <h2>
                  {t(`${message}`) || label}
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
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
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
