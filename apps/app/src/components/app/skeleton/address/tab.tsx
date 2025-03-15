'use client';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';

import TabPanelGeneralSkeleton from '@/components/app/skeleton/address/dynamicTab';
import { Link } from '@/i18n/routing';

export default function TabSkeletion({
  parse,
}: {
  error?: boolean;
  reset?: any;
  parse: any;
}) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();
  const tab = searchParams?.get('tab') || 'txns';

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
      label: 'Balance Changes',
      message: 'Balance Changes',
      name: 'balancechanges',
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
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 dark:hover:bg-black-100 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
      },
    );
  return (
    <>
      <div className="block lg:flex lg:space-x-2 mb-10 mt-5">
        <div className="w-full">
          <div className="w-full ">
            <div className="flex overflow-x-auto min-w-full min-h-fit pt-2">
              {tabs?.map(({ message, name }: any) => {
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
                        ? `/address/${params.id}`
                        : `/address/${params.id}?tab=${name}`
                    }
                    key={name}
                    prefetch={true}
                    scroll={false}
                  >
                    <h2 className="relative font-semibold">
                      {message}
                      {name === 'contract' && (
                        <div className="absolute text-white dark:text-black bg-neargreen text-[8px] h-4 inline-flex items-center rounded-md  -mt-3 px-1">
                          NEW
                        </div>
                      )}
                    </h2>{' '}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
            {tab === 'txns' ? (
              <TabPanelGeneralSkeleton tab={tab || 'txns'} />
            ) : null}
            {tab === 'receipts' ? (
              <TabPanelGeneralSkeleton tab={tab || 'receipts'} />
            ) : null}

            {tab === 'tokentxns' ? <TabPanelGeneralSkeleton tab={tab} /> : null}

            {tab === 'nfttokentxns' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}
            {tab === 'balancechanges' ? (
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
