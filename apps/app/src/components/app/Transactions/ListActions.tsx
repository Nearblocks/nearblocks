'use client';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useIntlRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import React, { useState } from 'react';
import { getFilteredQueryParams, localFormat } from '@/utils/app/libs';
import { txnMethod } from '@/utils/app/near';
import { yoctoToNear } from '@/utils/libs';
import { FilterKind } from '@/utils/types';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import Filters from '@/components/app/common/Filters';
import TxnStatus from '@/components/app/common/Status';
import Table from '@/components/app/common/Table';
import Timestamp from '@/components/app/common/Timestamp';
import Tooltip from '@/components/app/common/Tooltip';
import Clock from '@/components/app/Icons/Clock';
import FaInbox from '@/components/app/Icons/FaInbox';
import FaLongArrowAltRight from '@/components/app/Icons/FaLongArrowAltRight';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import { TxnCountRes, Txn, TxnsRes } from 'nb-schemas';
interface ListProps {
  error: boolean;
  txnsCount: TxnCountRes;
  txnsData: TxnsRes;
}

const ListActions = ({ error, txnsCount, txnsData }: ListProps) => {
  const router = useIntlRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [showAge, setShowAge] = useState(true);
  const [page, setPage] = useState(1);
  const t = useTranslations();
  const errorMessage = t('noTxns') || ' No transactions found!';

  const count = txnsCount?.data?.count;
  const txns = txnsData?.data;
  let cursor = txnsData?.meta?.cursor;

  const currentParams = QueryString.parse(searchParams?.toString() || '');
  const toggleShowAge = () => setShowAge((prev) => !prev);
  const onAllClear = () => {
    const { block, cursor, page, after_ts, before_ts, ...newQuery } =
      currentParams;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const modifiedFilter = getFilteredQueryParams(currentParams, [
    FilterKind.BLOCK,
    FilterKind.AFTER_TS,
    FilterKind.BEFORE_TS,
  ]);

  const columns: any = [
    {
      cell: (row: Txn) => (
        <>
          <TxnStatus showLabel={false} status={row?.outcomes?.status} />
        </>
      ),
      header: <span></span>,
      key: '',
      tdClassName:
        'pl-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-12',
    },
    {
      cell: (row: Txn) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.transaction_hash}
          >
            <AddressOrTxnsLink
              copy
              txnHash={row?.transaction_hash}
              className={
                'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
              }
            />
          </Tooltip>
        </span>
      ),
      header: (
        <span suppressHydrationWarning={true}>{t('hash') || 'TXN HASH'}</span>
      ),
      key: 'transaction_hash',
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10 w-44',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap  text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: Txn) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={txnMethod(row?.actions, t)}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate" suppressHydrationWarning={true}>
                {txnMethod(row?.actions, t)}
              </span>
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <span className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
          {t('type') || 'METHOD'}
        </span>
      ),
      key: 'actions',
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-40',
      thClassName: 'px-1.5',
    },
    {
      cell: (row: Txn) => (
        <span>
          {row?.actions_agg?.deposit
            ? yoctoToNear(row?.actions_agg?.deposit, true)
            : row?.actions_agg?.deposit ?? ''}{' '}
          Ⓝ
        </span>
      ),
      header: (
        <span suppressHydrationWarning={true}>
          {t('depositValue') || 'DEPOSIT VALUE'}
        </span>
      ),
      key: 'deposit',
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: Txn) => (
        <span>
          {row?.outcomes_agg?.transaction_fee
            ? yoctoToNear(row?.outcomes_agg?.transaction_fee, true)
            : row?.outcomes_agg?.transaction_fee ?? ''}{' '}
          Ⓝ
        </span>
      ),
      header: (
        <span suppressHydrationWarning={true}>{t('txnFee') || 'TXN FEE'}</span>
      ),
      key: 'transaction_fee',
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: Txn) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.signer_account_id}
          >
            <span>
              <AddressOrTxnsLink
                copy
                currentAddress={row?.signer_account_id}
                className={
                  'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                }
              />
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <span className="flex relative items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
          {t('from') || 'FROM'}
        </span>
      ),
      key: 'signer_account_id',
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-48',
      thClassName: 'px-1',
    },
    {
      cell: () => (
        <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
          <FaLongArrowAltRight />
        </div>
      ),
      header: <span></span>,
      key: '',
    },
    {
      cell: (row: Txn) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.receiver_account_id}
          >
            <span>
              <AddressOrTxnsLink
                copy
                currentAddress={row?.receiver_account_id}
                className={
                  'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                }
              />
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <span className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
          {t('to') || 'To'}
        </span>
      ),
      key: 'receiver_account_id',
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-48',
    },
    {
      cell: (row: Txn) => (
        <span>
          <Link
            className="text-green-500 dark:text-green-250 hover:no-underline font-medium"
            href={`/blocks/${row?.block?.block_hash}`}
          >
            {row?.block?.block_height
              ? localFormat(row?.block?.block_height)
              : row?.block?.block_height ?? ''}
          </Link>
        </span>
      ),
      header: (
        <span className="flex items-center text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
          {t('blockHeight') || ' BLOCK HEIGHT'}
        </span>
      ),
      key: 'block_height',
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: Txn) => (
        <span>
          <Timestamp
            showAge={showAge}
            timestamp={row?.block?.block_timestamp}
          />
        </span>
      ),
      header: (
        <div className="w-full inline-flex px-4 py-4">
          <Tooltip
            className={'max-w-[200px] whitespace-nowrap -ml-3'}
            position="bottom"
            tooltip={
              showAge
                ? 'Click to show Datetime Format'
                : 'Click to show Age Format'
            }
          >
            <button
              className="text-left text-xs w-full h-5 flex items-center font-semibold uppercase tracking-wider  text-green-500  dark:text-green-250 focus:outline-none whitespace-nowrap"
              onClick={toggleShowAge}
              suppressHydrationWarning={true}
              type="button"
            >
              {showAge ? t('age') || 'AGE' : t('ageDT') || 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: 'inline-flex',
    },
  ];

  return (
    <div className=" bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
      <div className={`flex flex-wrap py-4 items-center justify-between`}>
        <div className="flex flex-col">
          <p
            className="leading-7 pl-6 text-sm text-nearblue-600 dark:text-neargray-10"
            suppressHydrationWarning={true}
          >
            {modifiedFilter && Object.keys(modifiedFilter).length > 0
              ? count &&
                Array.isArray(txns) &&
                txns?.length > 0 &&
                `${`A total of ${localFormat(
                  count.toString(),
                )} transactions found`}`
              : count &&
                Array.isArray(txns) &&
                txns?.length > 0 &&
                `${
                  t('txnsListing', {
                    count: localFormat ? localFormat(count.toString()) : '',
                  }) || `More than > ${count} transactions found`
                }`}
          </p>
        </div>
        {modifiedFilter && Object.keys(modifiedFilter).length > 0 && (
          <div className="lg:ml-auto px-6">
            <Filters filters={modifiedFilter} onClear={onAllClear} />
          </div>
        )}
      </div>
      <Table
        columns={columns}
        cursor={cursor}
        cursorPagination={true}
        data={txns}
        Error={error}
        ErrorText={
          <ErrorMessage
            icons={<FaInbox />}
            message={errorMessage}
            mutedText="Please try again later"
          />
        }
        limit={25}
        page={page}
        setPage={setPage}
      />
    </div>
  );
};

export default ListActions;
