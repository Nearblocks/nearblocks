'use client';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import React, { useState } from 'react';

import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Link } from '@/i18n/routing';
import { txnMethod } from '@/utils/app/near';
import { isAction, localFormat, yoctoToNear } from '@/utils/libs';
import { FilterKind, TransactionInfo } from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import Filters from '../common/Filters';
import TxnStatus from '../common/Status';
import Table from '../common/Table';
import TableSummary from '../common/TableSummary';
import TimeStamp from '../common/TimeStamp';
import Tooltip from '../common/Tooltip';
import Clock from '../Icons/Clock';
import Download from '../Icons/Download';
import FaInbox from '../Icons/FaInbox';
import Filter from '../Icons/Filter';
import SortIcon from '../Icons/SortIcon';
import { getFilteredQueryParams } from '@/utils/app/libs';
import { AddressDisplay } from '@/components/app/common/HoverContextProvider';

const initialForm = {
  action: '',
  from: '',
  method: '',
  to: '',
};

interface TxnsProps {
  count: string;
  cursor: string;
  error: boolean;
  id: string;
  txns: TransactionInfo[];
}

const TransactionActions = ({
  count,
  cursor, //   tab,
  error,
  id,
  txns,
}: TxnsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const order = searchParams?.get('order');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [showAge, setShowAge] = useState(true);
  const t = useTranslations();
  const errorMessage = t('noTxns') || ' No transactions found!';

  const toggleShowAge = () => setShowAge((s) => !s);

  const currentParams = QueryString.parse(searchParams?.toString() || '');

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'type') {
      if (isAction(value)) {
        return setForm((state) => ({
          ...state,
          action: value,
          method: '',
        }));
      }

      return setForm((state) => ({
        ...state,
        action: '',
        method: value,
      }));
    }

    return setForm((f) => ({ ...f, [name]: value }));
  };

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
  };

  const onOrder = () => {
    const currentOrder = searchParams?.get('order') || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    const newParams = { ...currentParams, order: newOrder };
    const newQueryString = QueryString.stringify(newParams);

    router.push(`${pathname}?${newQueryString}`);
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

  const columns: any = [
    {
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus showLabel={false} status={row.outcomes.status} />
        </>
      ),
      header: <span></span>,
      key: '',
      tdClassName:
        'pl-5 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row.transaction_hash}
          >
            <span className="truncate max-w-[120px] inline-block align-bottom text-green-500  dark:text-green-250 whitespace-nowrap">
              <Link
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                href={`/txns/${row.transaction_hash}`}
              >
                {row.transaction_hash}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: <span>{t('hash') || 'TXN HASH'}</span>,
      key: 'transaction_hash',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
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
              <span className="block truncate">
                {txnMethod(row?.actions, t)}
              </span>
            </span>
          </Tooltip>
        </span>
      ),
      header: <span className="pl-2"> {t('type') || 'METHOD'}</span>,
      key: 'actions',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          {row.actions_agg?.deposit
            ? yoctoToNear(row.actions_agg?.deposit, true)
            : row.actions_agg?.deposit ?? ''}{' '}
          Ⓝ
        </span>
      ),
      header: <span>{t('depositValue') || 'DEPOSIT VALUE'}</span>,
      key: 'deposit',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          {row.outcomes_agg?.transaction_fee
            ? yoctoToNear(row.outcomes_agg?.transaction_fee, true)
            : ''}{' '}
          Ⓝ
        </span>
      ),
      header: <span>{'TXN FEE'}</span>,
      key: 'transaction_fee',
      tdClassName:
        'px-6 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
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
              <AddressDisplay
                copy
                className={'align-bottom whitespace-nowrap'}
                currentAddress={row?.signer_account_id}
              />
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <>
          <PopoverRoot positioning={{ sameWidth: true }}>
            <PopoverTrigger
              asChild
              className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
            >
              <button>
                {t ? t('filter.from') : 'FROM'}{' '}
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
              <form className="flex flex-col" onSubmit={onFilter}>
                <input
                  className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                  name="from"
                  onChange={onChange}
                  placeholder={
                    t ? t('filter.placeholder') : 'Search by address e.g. Ⓝ..'
                  }
                  value={form.from}
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
                    className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10 text-xs h-7"
                    name="from"
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
      key: 'signer_account_id',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-44',
    },
    {
      cell: (row: TransactionInfo) => {
        return row.predecessor_account_id === row.receiver_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 flex items-center justify-center bg-green-200 dark:bg-nearblue-650/[0.15] dark:text-neargray-650 dark:border dark:border-nearblue-650/[0.25] text-white text-xs font-semibold">
            {t('txnSelf') || 'SELF'}
          </span>
        ) : id === row.predecessor_account_id ? (
          <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60 text-yellow-700 text-xs font-semibold">
            {t('txnOut') || 'OUT'}
          </span>
        ) : (
          <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-neargreen dark:bg-green-500/[0.15] dark:text-neargreen-300 dark:border dark:border-green-400/75 text-white text-xs font-semibold">
            {t('txnIn') || 'IN'}
          </span>
        );
      },
      header: <span></span>,
      key: '',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row.receiver_account_id}
          >
            <span>
              <AddressDisplay
                copy
                className={'align-bottom whitespace-nowrap'}
                currentAddress={row?.receiver_account_id}
              />
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <>
          <PopoverRoot positioning={{ sameWidth: true }}>
            <PopoverTrigger
              asChild
              className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
            >
              <button>
                {t('to') || 'To'}
                <Filter className="h-4 w-4 fill-current ml-2" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 p-2 z-20"
              marginTop={-1.5}
              roundedBottom={'lg'}
              roundedTop={'none'}
              width={48}
            >
              <form className="flex flex-col" onSubmit={onFilter}>
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
                    className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 h-7 text-white dark:text-black text-xs mr-2"
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
        </>
      ),
      key: 'receiver_account_id',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-44',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Link
            className="text-green-500  dark:text-green-250 hover:no-underline"
            href={`/blocks/${row.included_in_block_hash}`}
          >
            {row.block?.block_height
              ? localFormat(row.block?.block_height)
              : ''}
          </Link>
        </span>
      ),
      header: <span>{t('blockHeight') || ' BLOCK HEIGHT'}</span>,
      key: 'block_height',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
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
            className={'left-1/2 max-w-[200px] whitespace-nowrap'}
            position="bottom"
            tooltip={
              showAge
                ? 'Click to show Datetime Format'
                : 'Click to show Age Format'
            }
          >
            <button
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
              onClick={toggleShowAge}
              type="button"
            >
              {showAge ? t('age') || 'AGE' : t('ageDT') || 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
          <button className="px-2" onClick={onOrder} type="button">
            <div className="text-nearblue-600 font-semibold">
              <SortIcon order={order as string} />
            </div>
          </button>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: 'whitespace-nowrap',
    },
  ];

  const modifiedFilter = getFilteredQueryParams(currentParams, [
    FilterKind.ACTION,
    FilterKind.METHOD,
    FilterKind.FROM,
    FilterKind.TO,
  ]);

  return (
    <>
      <TableSummary
        filters={<Filters filters={modifiedFilter} onClear={onAllClear} />}
        linkToDowload={
          txns &&
          Object?.keys(txns)?.length > 0 && (
            <>
              <button className="hover:no-underline">
                <Link
                  className="flex items-center text-nearblue-600 dark:text-neargray-10 font-medium py-2 border border-neargray-700 dark:border-black-200 px-4 rounded-md bg-white dark:bg-black-600 hover:bg-neargray-800 whitespace-nowrap"
                  href={`/exportdata?address=${id}&type=transactions`}
                >
                  <p>CSV Export</p>
                  <span className="ml-2">
                    <Download />
                  </span>
                </Link>
              </button>
            </>
          )
        }
        text={
          txns &&
          !error &&
          `A total of${' '}
              ${count ? localFormat && localFormat(count.toString()) : 0}${' '}
              transactions found`
        }
      />
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
    </>
  );
};

export default TransactionActions;
