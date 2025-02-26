'use client';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';

import TabPanelGeneralSkeleton from '@/components/app/skeleton/address/dynamicTab';
import { Link } from '@/i18n/routing';

import ErrorMessage from '../../common/ErrorMessage';
import TableSummary from '../../common/TableSummary';
import FaInbox from '../../Icons/FaInbox';

export default function TabSkeletion({
  error = false,
  reset,
}: {
  error?: boolean;
  reset?: any;
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
      label: 'Multichain Transactions',
      message: t('multi-chainTxns'),
      name: 'multichaintxns',
    },
    { label: 'Access Keys', message: t('accessKeys'), name: 'accesskeys' },
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
                return (
                  <Link
                    className={getClassName(name === tab)}
                    href={
                      name === 'txns'
                        ? `/address/${params.id}`
                        : `/address/${params.id}?tab=${name}`
                    }
                    key={name}
                  >
                    <h2 className="font-semibold"> {message}</h2>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1 w-full">
            {error && (
              <>
                <TableSummary text="" />
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
                    <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
                      <tr className="h-[57px]">
                        <td
                          className="px-6 py-4 text-gray-400 text-xs"
                          colSpan={100}
                        >
                          <ErrorMessage
                            icons={<FaInbox />}
                            message={''}
                            mutedText="Please try again later"
                            reset={reset}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {!error && tab === 'txns' ? (
              <TabPanelGeneralSkeleton tab={tab || 'txns'} />
            ) : null}
            {!error && tab === 'receipts' ? (
              <TabPanelGeneralSkeleton tab={tab || 'receipts'} />
            ) : null}

            {!error && tab === 'tokentxns' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}

            {!error && tab === 'nfttokentxns' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}
            {!error && tab === 'multichaintxns' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}
            {!error && tab === 'accesskeys' ? (
              <TabPanelGeneralSkeleton tab={tab} />
            ) : null}
            {!error && tab === 'contract' ? (
              <TabPanelGeneralSkeleton tab={'contract'} />
            ) : null}
          </div>
        </div>
      </div>
      <div className="mb-10"></div>
    </>
  );
}
