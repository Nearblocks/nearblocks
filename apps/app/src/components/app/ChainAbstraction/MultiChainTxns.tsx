'use client';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import React, { use, useState } from 'react';

import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Link, usePathname, useIntlRouter } from '@/i18n/routing';
import { chainAbstractionExplorerUrl } from '@/utils/app/config';
import { getFilteredQueryParams, localFormat } from '@/utils/app/libs';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import Filters from '@/components/app/common/Filters';
import Table from '@/components/app/common/Table';
import TableSummary from '@/components/app/common/TableSummary';
import Timestamp from '@/components/app/common/Timestamp';
import Tooltip from '@/components/app/common/Tooltip';
import Clock from '@/components/app/Icons/Clock';
import FaInbox from '@/components/app/Icons/FaInbox';
import Filter from '@/components/app/Icons/Filter';
import Near from '@/components/app/Icons/Near';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import { MCTxnCount, MCTxn } from 'nb-schemas';
import { useNetworkIcons } from '@/hooks/app/useNetworkIcons';
import { FilterKind } from '@/utils/types';
import Skeleton from '@/components/app/skeleton/common/Skeleton';

interface MultiChainTxnsProps {
  dataPromise: Promise<{ data: MCTxn[]; meta?: { cursor?: string } }>;
  countPromise: Promise<MCTxnCount>;
  isTab: boolean;
  tab: string;
}

const MultiChainTxns = ({
  countPromise,
  dataPromise,
  isTab,
  tab,
}: MultiChainTxnsProps) => {
  const countData = use(countPromise);
  const data = use(dataPromise);
  const txns = data?.data;
  const error = !txns || data?.data?.length === 0;
  const cursor = data?.meta?.cursor;
  const count = countData?.count || 0;
  const t = useTranslations();
  const router = useIntlRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const networkIcon = useNetworkIcons;
  const initialForm = {
    chain: searchParams?.get('chain') || '',
    account: searchParams?.get('account') || '',
  };
  const [form, setForm] = useState(initialForm);
  const [showAge, setShowAge] = useState(true);
  const errorMessage = t ? t('noTxns') : ' No transactions found!';

  const toggleShowAge = () => setShowAge((s) => !s);
  const onChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;

    return setForm((f) => ({ ...f, [name]: value }));
  };

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);

    const { chain, account } = form;
    const { cursor, p, ...updatedQuery } = QueryString.parse(
      searchParams?.toString() || '',
    );

    const queryParams = {
      ...(account && { account }),
      ...(chain && { chain }),
    };

    const finalQuery = QueryString.stringify({
      ...updatedQuery,
      ...queryParams,
    });

    router.push(`${pathname}?${finalQuery}`);
  };

  const currentParams = QueryString.parse(searchParams?.toString() || '');

  const onClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;

    setPage(1);
    const { cursor, p, ...restQuery } = QueryString.parse(
      searchParams?.toString() || '',
    );

    setForm((f) => ({ ...f, [name]: '' }));
    const { [name]: _, ...newQuery } = restQuery;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const onAllClear = () => {
    setForm(initialForm);
    const { chain, cursor, account, p, ...newQuery } = QueryString.parse(
      searchParams?.toString() || '',
    );
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const handleChainSelect = (
    chain: string,
    address?: string,
    txnHash?: string,
  ) => {
    return chain in chainAbstractionExplorerUrl && address
      ? chainAbstractionExplorerUrl[
          chain as keyof typeof chainAbstractionExplorerUrl
        ]?.address(address)
      : chain in chainAbstractionExplorerUrl && txnHash
      ? chainAbstractionExplorerUrl[
          chain as keyof typeof chainAbstractionExplorerUrl
        ].transaction(txnHash)
      : '';
  };

  const columns: any = [
    {
      cell: (row: MCTxn) =>
        row?.receipt_id && row?.transaction_hash ? (
          <Tooltip
            className={'left-20 max-w-[200px]'}
            position="top"
            tooltip={row?.receipt_id}
          >
            <span className="truncate max-w-[150px] inline-block align-bottom text-green-500  dark:text-green-250 whitespace-nowrap ">
              <Link
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                href={`/txns/${row?.transaction_hash}?tab=execution#${row?.receipt_id}`}
              >
                {row?.receipt_id}
              </Link>
            </span>
          </Tooltip>
        ) : (
          <Skeleton className="h-4 w-32" />
        ),
      header: <span>{t ? t('receiptId') : 'RECEIPT ID'}</span>,
      key: 'receipt_id',
      tdClassName:
        'pl-6 pr-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'pl-6 pr-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: MCTxn) =>
        row?.transaction_hash ? (
          <span>
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row?.transaction_hash}
            >
              <span className="flex items-center">
                {row?.transaction_hash && (
                  <div className="flex items-center mr-1">
                    <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                      <Near className="w-4 h-4 text-nearblue-600 dark:text-neargray-10" />
                    </div>
                  </div>
                )}
                <AddressOrTxnsLink
                  copy
                  txnHash={row?.transaction_hash}
                  className={
                    'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                  }
                />
              </span>
            </Tooltip>
          </span>
        ) : (
          <Skeleton className="h-4 w-32" />
        ),
      header: <span>{t ? t('sourceTxn') : 'SOURCE TXN HASH'}</span>,
      key: 'source_transaction_hash',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: MCTxn) =>
        row?.account_id ? (
          <span>
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row?.account_id}
            >
              <span className="flex items-center">
                {row?.account_id && (
                  <div className="flex items-center mr-1">
                    <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                      <Near className="w-4 h-4 text-nearblue-600 dark:text-neargray-10" />
                    </div>
                  </div>
                )}

                <AddressOrTxnsLink
                  copy
                  currentAddress={row?.account_id}
                  className={
                    'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                  }
                />
              </span>
            </Tooltip>
          </span>
        ) : (
          <Skeleton className="h-4 w-20" />
        ),
      header: (
        <>
          <PopoverRoot positioning={{ sameWidth: true }}>
            <PopoverTrigger
              asChild
              className="flex items-center  text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
            >
              <button>
                {t ? t('from') : 'FROM'}{' '}
                <Filter className="h-4 w-4 fill-current ml-2" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="bg-white dark:bg-black-600 dark:border-black-200 shadow-lg border p-2 z-20"
              marginTop={2.5}
              roundedBottom={'lg'}
              roundedTop={'none'}
              width={'48'}
            >
              <form className="flex flex-col" onSubmit={onFilter}>
                <input
                  className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                  name="account"
                  onChange={onChange}
                  placeholder={
                    t ? t('filter.placeholder') : 'Search by address e.g. Ⓝ..'
                  }
                  value={form.account}
                />
                <div className="flex">
                  <button
                    className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 h-7 text-white dark:text-black text-xs mr-2"
                    type="submit"
                  >
                    <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                    {t ? t('filter.filter') : 'Filter'}
                  </button>
                  <button
                    className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10  text-xs h-7"
                    name="account"
                    onClick={onClear}
                    type="button"
                  >
                    {t ? t('filter.clear') : 'Clear'}
                  </button>
                </div>
              </form>
            </PopoverContent>
          </PopoverRoot>
        </>
      ),
      key: 'account',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName: 'px-4 py-4',
    },
    {
      cell: (row: MCTxn) =>
        row?.dest_txn ? (
          <span>
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row?.dest_txn}
            >
              <span className="flex items-center">
                {row?.dest_txn && row?.dest_chain ? (
                  <div className="flex items-center mr-1">
                    <div className="flex items-center">
                      <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                        {networkIcon({ network: row?.dest_chain })}
                      </div>
                      <AddressOrTxnsLink
                        copy
                        txnHash={row?.dest_txn}
                        href={handleChainSelect(
                          row?.dest_chain?.toLowerCase() || '',
                          '',
                          row?.dest_txn,
                        )}
                        className="ml-2 truncate max-w-[100px] inline-block align-bottom whitespace-nowrap"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </span>
            </Tooltip>
          </span>
        ) : (
          <span className="text-gray-500 italic text-xs">
            {t('destinationNetworkNotIndexed')}
          </span>
        ),
      header: <span>{t ? t('destinationTxn') : 'DESTINATION TXN HASH'}</span>,
      key: 'destination_transaction_hash',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: MCTxn) =>
        row?.dest_address ? (
          <span>
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row?.dest_address}
            >
              <span className="flex items-center">
                {row?.dest_address && row?.dest_chain && (
                  <div className="flex items-center mr-1">
                    <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                      {networkIcon({ network: row?.dest_chain })}
                    </div>
                  </div>
                )}
                {row?.dest_address ? (
                  <AddressOrTxnsLink
                    copy
                    currentAddress={row?.dest_address}
                    href={handleChainSelect(
                      row?.dest_chain?.toLowerCase() || '',
                      row?.dest_address,
                    )}
                    className={
                      'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                    }
                  />
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </span>
            </Tooltip>
          </span>
        ) : (
          <span className="text-gray-500 italic text-xs">
            {t('destinationNetworkNotIndexed')}
          </span>
        ),
      header: (
        <span>{t ? t('destinationAddress') : 'DESTINATION ADDRESS'}</span>
      ),
      key: 'dest_address',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: MCTxn) =>
        row?.block?.block_hash && row?.block?.block_height ? (
          <span>
            <Link
              className="text-green-500  dark:text-green-250 hover:no-underline"
              href={`/blocks/${row.block?.block_hash}`}
            >
              {row.block?.block_height
                ? localFormat(row.block?.block_height)
                : ''}
            </Link>
          </span>
        ) : (
          <Skeleton className="h-4 w-32" />
        ),
      header: <span>{t('blockHeight') || ' BLOCK HEIGHT'}</span>,
      key: 'block_height',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: MCTxn) =>
        row?.block?.block_timestamp ? (
          <span>
            <Timestamp
              showAge={showAge}
              timestamp={row?.block?.block_timestamp}
            />
          </span>
        ) : (
          <Skeleton className="h-4 w-28" />
        ),
      header: (
        <div className="w-full inline-flex px-4 py-4">
          <Tooltip
            className={'left-1/2 max-w-[200px] top-6'}
            position="bottom"
            tooltip={
              <span className="flex flex-wrap">
                <span className="whitespace-nowrap">Click to show</span>{' '}
                <span className="whitespace-nowrap">
                  {showAge ? 'Datetime' : 'Age'} Format
                </span>
              </span>
            }
          >
            <button
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
              onClick={toggleShowAge}
              type="button"
            >
              {showAge
                ? t
                  ? t('age')
                  : 'AGE'
                : t
                ? t('ageDT')
                : 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: '',
    },
  ];

  const modifiedFilter = getFilteredQueryParams(currentParams, [
    FilterKind.CHAIN,
    FilterKind.ACCOUNT,
  ]);

  return (
    <>
      {!isTab || tab === 'multichaintxns' ? (
        <>
          <div className=" bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
            {isTab && (
              <TableSummary
                filters={
                  <Filters filters={modifiedFilter} onClear={onAllClear} />
                }
                text={
                  txns &&
                  !error &&
                  `${`A total of${' '}
              ${count ? localFormat && localFormat(count.toString()) : 0}${' '}
              multichain transactions found`}`
                }
              />
            )}
            <Table
              columns={columns}
              cursor={cursor}
              cursorPagination={true}
              data={txns}
              Error={error}
              ErrorText={
                <ErrorMessage
                  icons={<FaInbox />}
                  message={errorMessage || ''}
                  mutedText="Please try again later"
                />
              }
              limit={25}
              page={page}
              setPage={setPage}
            />
          </div>
        </>
      ) : (
        <div className="w-full h-[500px]"></div>
      )}
    </>
  );
};
export default MultiChainTxns;
