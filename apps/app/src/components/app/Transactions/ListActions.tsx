'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import React, { useState } from 'react';

import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  getFilteredQueryParams,
  isAction,
  localFormat,
} from '@/utils/app/libs';
import { txnMethod } from '@/utils/app/near';
import { yoctoToNear } from '@/utils/libs';
import { FilterKind, TransactionInfo } from '@/utils/types';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import Filters from '@/components/app/common/Filters';
import TxnStatus from '@/components/app/common/Status';
import Table from '@/components/app/common/Table';
import TimeStamp from '@/components/app/common/TimeStamp';
import Tooltip from '@/components/app/common/Tooltip';
import Clock from '@/components/app/Icons/Clock';
import FaInbox from '@/components/app/Icons/FaInbox';
import FaLongArrowAltRight from '@/components/app/Icons/FaLongArrowAltRight';
import Filter from '@/components/app/Icons/Filter';
import SortIcon from '@/components/app/Icons/SortIcon';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

interface ListProps {
  error: boolean;
  txnsCount: {
    txns: { count: string }[];
  };
  txnsData: {
    cursor: string;
    txns: TransactionInfo[];
  };
}

const ListActions = ({ error, txnsCount, txnsData }: ListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const order = searchParams?.get('order');
  const [showAge, setShowAge] = useState(true);
  const initialForm = {
    action: searchParams?.get('action') || '',
    from: searchParams?.get('from') || '',
    method: searchParams?.get('method') || '',
    to: searchParams?.get('to') || '',
  };
  const [form, setForm] = useState(initialForm);
  const [page, setPage] = useState(1);
  const t = useTranslations();
  const errorMessage = t('noTxns') || ' No transactions found!';

  const count = txnsCount?.txns[0]?.count;
  const txns = txnsData?.txns;
  let cursor = txnsData?.cursor;

  const currentParams = QueryString.parse(searchParams?.toString() || '');
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'type') {
      if (isAction(value)) {
        setForm((prev) => ({ ...prev, action: value, method: '' }));
      } else {
        setForm((prev) => ({ ...prev, action: '', method: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleShowAge = () => setShowAge((prev) => !prev);

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);

    const { action, from, method, to } = form;
    const { cursor, page, ...updatedQuery } = currentParams;

    const queryParams = {
      ...updatedQuery,
      ...(action && { action }),
      ...(method && { method }),
      ...(from && { from }),
      ...(to && { to }),
    };

    const newQueryString = QueryString.stringify(queryParams);
    router.push(`${pathname}?${newQueryString}`);
    router.refresh();
  };

  const onClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;

    setPage(1);
    const { cursor, page, ...restQuery } = currentParams;

    if (name === 'type') {
      setForm((prev) => ({ ...prev, action: '', method: '' }));
      const { action, method, ...newQuery } = restQuery;
      const newQueryString = QueryString.stringify(newQuery);
      router.push(`${pathname}?${newQueryString}`);
    } else {
      setForm((f) => ({ ...f, [name]: '' }));
      const { [name]: _, ...newQuery } = restQuery;
      const newQueryString = QueryString.stringify(newQuery);
      router.push(`${pathname}?${newQueryString}`);
    }
  };
  const onAllClear = () => {
    setForm(initialForm);
    const { action, block, cursor, from, method, page, to, ...newQuery } =
      currentParams;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const onOrder = () => {
    const currentOrder = searchParams?.get('order') || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    const newParams = { order: newOrder };
    const newQueryString = QueryString.stringify(newParams);
    router.push(`${pathname}?${newQueryString}`);
  };

  const modifiedFilter = getFilteredQueryParams(currentParams, [
    FilterKind.ACTION,
    FilterKind.METHOD,
    FilterKind.FROM,
    FilterKind.TO,
    FilterKind.BLOCK,
  ]);

  const columns: any = [
    {
      cell: (row: TransactionInfo) => (
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
      cell: (row: TransactionInfo) => (
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
      cell: (row: TransactionInfo) => (
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
        <PopoverRoot positioning={{ sameWidth: true }}>
          <PopoverTrigger
            asChild
            className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
            suppressHydrationWarning={true}
          >
            <button>
              {t('type') || 'METHOD'}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-white absolute dark:bg-black-600 dark:border-black-200 shadow-lg border p-2 z-20"
            marginTop={-1.5}
            roundedBottom={'lg'}
            roundedTop={'none'}
            width={'48'}
          >
            <form className="flex flex-col" onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                name="type"
                onChange={onChange}
                placeholder="Search by method"
                value={form.action || form.method}
              />
              <div className="flex">
                <button
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 h-7 text-white dark:text-black text-xs mr-2"
                  type="submit"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t('filter.filter') || 'Filter'}
                </button>
                <button
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10 text-xs h-7"
                  name="type"
                  onClick={onClear}
                  type="button"
                >
                  {t('filter.clear') || 'Clear'}
                </button>
              </div>
            </form>
          </PopoverContent>
        </PopoverRoot>
      ),
      key: 'actions',
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-40',
      thClassName: 'px-1.5',
    },
    {
      cell: (row: TransactionInfo) => (
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
      cell: (row: TransactionInfo) => (
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
      cell: (row: TransactionInfo) => (
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
        <PopoverRoot positioning={{ sameWidth: true }}>
          <PopoverTrigger
            asChild
            className="flex relative items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
            suppressHydrationWarning={true}
          >
            <button>
              {t('from') || 'FROM'}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-white dark:bg-black-600 dark:border-black-200 shadow-lg border p-2 z-20"
            marginTop={-1.5}
            roundedBottom={'lg'}
            roundedTop={'none'}
            width={48}
          >
            <form onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600  dark:text-neargray-10 text-xs"
                name="from"
                onChange={onChange}
                placeholder={
                  t('filter.placeholder') || 'Search by address e.g. Ⓝ..'
                }
                value={form.from}
              />
              <div className="flex">
                <button
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 dark:text-black h-7 text-white text-xs mr-2"
                  type="submit"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t('filter.filter') || 'Filter'}
                </button>
                <button
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10 text-xs h-7"
                  name="from"
                  onClick={onClear}
                  type="button"
                >
                  {t('filter.clear') || 'Clear'}
                </button>
              </div>
            </form>
          </PopoverContent>
        </PopoverRoot>
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
      cell: (row: TransactionInfo) => (
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
        <PopoverRoot positioning={{ sameWidth: true }}>
          <PopoverTrigger
            asChild
            className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
            suppressHydrationWarning={true}
          >
            <button>
              {t('to') || 'To'}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-white dark:bg-black-600 dark:border-black-200 shadow-lg border p-2 z-20"
            marginTop={-1.5}
            roundedBottom={'lg'}
            roundedTop={'none'}
            width={48}
          >
            <form onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                name="to"
                onChange={onChange}
                placeholder={
                  t('filter.placeholder') || 'Search by address e.g. Ⓝ..'
                }
                value={form.to}
              />
              <div className="flex">
                <button
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 h-7 dark:text-black text-white text-xs mr-2"
                  type="submit"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t('filter.filter') || 'Filter'}
                </button>
                <button
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10 text-xs h-7"
                  name="to"
                  onClick={onClear}
                  type="button"
                >
                  {t('filter.clear') || 'Clear'}
                </button>
              </div>
            </form>
          </PopoverContent>
        </PopoverRoot>
      ),
      key: 'receiver_account_id',
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-48',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Link
            className="text-green-500 dark:text-green-250 hover:no-underline font-medium"
            href={`/blocks/${row?.included_in_block_hash}`}
          >
            {row?.block?.block_height
              ? localFormat(row?.block?.block_height)
              : row?.block?.block_height ?? ''}
          </Link>
        </span>
      ),
      header: (
        <span suppressHydrationWarning={true}>
          {' '}
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
      cell: (row: TransactionInfo) => (
        <span>
          <TimeStamp showAge={showAge} timestamp={row?.block_timestamp} />
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
          <button className="px-2" onClick={onOrder} type="button">
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
              <SortIcon order={order as string} />
            </div>
          </button>
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
                txns?.length > 0 &&
                `${`A total of ${localFormat(
                  count.toString(),
                )} transactions found`}`
              : count &&
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
