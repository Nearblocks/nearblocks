'use client';
import { Menu, MenuList, MenuButton } from '@reach/menu-button';
import {
  localFormat,
  isAction,
  yoctoToNear,
  truncateString,
} from '@/utils/libs';
import React, { useEffect, useState } from 'react';
import TxnStatus from '../common/Status';
import Link from 'next/link';
import { Tooltip } from '@reach/tooltip';
import Filter from '../Icons/Filter';
import Filters from '../common/Filters';
import Download from '../Icons/Download';
import Question from '../Icons/Question';
import Clock from '../Icons/Clock';
import SortIcon from '../Icons/SortIcon';
import Table from '../common/Table';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import SwitchButton from '../SwitchButton';
import TimeStamp from '../common/TimeStamp';
import QueryString from 'qs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TransactionInfo } from '@/app/utils/types';
import { txnMethod } from '@/app/utils/near';

const initialForm = {
  action: '',
  method: '',
  from: '',
  to: '',
};

interface TxnsProps {
  id: string;
  txns: TransactionInfo[];
  count: string;
  error: boolean;
  cursor: string;
  //   tab: string;
}
// Simulated absence of the translation function
const t = (key: string, p?: any): any => {
  p = {};
  const simulateAbsence = true; // Set to true to simulate absence of t
  return simulateAbsence ? undefined : { key, p }; // Return undefined to simulate absence
};

const TransactionActions = ({
  id,
  txns,
  count,
  error,
  cursor, //   tab,
}: TxnsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const order = searchParams?.get('order');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [showAge, setShowAge] = useState(true);
  const errorMessage = t('txns:noTxns') || ' No transactions found!';
  const [address, setAddress] = useState('');
  const [showAllReceipts, setShowAllReceipts] = useState(false);

  useEffect(() => {
    const allReceipts = localStorage.getItem('showAllReceipts');
    if (allReceipts === null) {
      localStorage.setItem('showAllReceipts', 'false');
    } else {
      setShowAllReceipts(allReceipts === 'true');
    }
  }, []);

  const handleToggle = () => {
    const allReceipts = !showAllReceipts;
    localStorage.setItem('showAllReceipts', allReceipts.toString());
    setShowAllReceipts(allReceipts);
  };

  const toggleShowAge = () => setShowAge((s) => !s);

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
        method: value,
        action: '',
      }));
    }

    return setForm((f) => ({ ...f, [name]: value }));
  };

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);

    const { action, method, from, to } = form;
    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const { cursor, p, ...updatedQuery } = currentParams;

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

  const onOrder = () => {
    const currentOrder = searchParams?.get('order') || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const newParams = { ...currentParams, order: newOrder };
    const newQueryString = QueryString.stringify(newParams);

    router.push(`${pathname}?${newQueryString}`);
    router.refresh();
  };

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
  };

  const handleMouseLeave = () => {
    setAddress('');
  };

  const onClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;

    setPage(1);
    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const { cursor, p, ...restQuery } = currentParams;

    if (name === 'type') {
      setForm((prev) => ({ ...prev, action: '', method: '' }));
      const { action, method, ...newQuery } = restQuery;
      const newQueryString = QueryString.stringify(newQuery);
      router.push(`${pathname}?${newQueryString}`);
      router.refresh();
    } else {
      setForm((f) => ({ ...f, [name]: '' }));
      const { [name]: _, ...newQuery } = restQuery;
      const newQueryString = QueryString.stringify(newQuery);
      router.push(`${pathname}?${newQueryString}`);
      router.refresh();
    }
  };
  const onAllClear = () => {
    setForm(initialForm);

    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const { cursor, action, p, method, from, to, block, ...newQuery } =
      currentParams;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
    router.refresh();
  };

  const columns: any = [
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus status={row.outcomes.status} showLabel={false} />
        </>
      ),
      tdClassName:
        'pl-5 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <span>{t('txns:hash') || 'TXN HASH'}</span>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            label={row.transaction_hash}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          >
            <span className="truncate max-w-[120px] inline-block align-bottom text-green-500  dark:text-green-250 whitespace-nowrap">
              <Link
                href={`/txns/${row.transaction_hash}`}
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
              >
                {row.transaction_hash}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: (
        <Menu>
          <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
            {t('txns:type') || 'METHOD'}
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="bg-white shadow-lg border rounded-b-lg p-2">
            <form onSubmit={onFilter} className="flex flex-col">
              <input
                name="type"
                value={form.action || form.method}
                onChange={onChange}
                placeholder="Search by method"
                className="border dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
              />
              <div className="flex">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white dark:text-black text-xs mr-2"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t('txns:filter.filter') || 'Filter'}
                </button>
                <button
                  name="type"
                  type="button"
                  onClick={onClear}
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-white text-xs h-7"
                >
                  {t('txns:filter.clear') || 'Clear'}
                </button>
              </div>
            </form>
          </MenuList>
        </Menu>
      ),
      key: 'actions',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            label={txnMethod(row.actions, t)}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">
                {txnMethod(row.actions, t)}
              </span>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <span>{t('txns:depositValue') || 'DEPOSIT VALUE'}</span>,
      key: 'deposit',
      cell: (row: TransactionInfo) => (
        <span>
          {row.actions_agg?.deposit
            ? yoctoToNear(row.actions_agg?.deposit, true)
            : row.actions_agg?.deposit ?? ''}{' '}
          Ⓝ
        </span>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t('txns:txnFee') || 'TXN FEE'}</span>,
      key: 'transaction_fee',
      cell: (row: TransactionInfo) => (
        <span>
          {row.outcomes_agg?.transaction_fee
            ? yoctoToNear(row.outcomes_agg?.transaction_fee, true)
            : ''}{' '}
          Ⓝ
        </span>
      ),
      tdClassName:
        'px-6 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: (
        <>
          <Menu>
            <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
              {t('txns:from') || 'FROM'}{' '}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </MenuButton>
            <MenuList className="bg-white shadow-lg border rounded-b-lg p-2">
              <form onSubmit={onFilter} className="flex flex-col">
                <input
                  name="from"
                  value={form.from}
                  onChange={onChange}
                  placeholder={
                    t('txns:filter.placeholder') || 'Search by address e.g. Ⓝ..'
                  }
                  className="border  dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                />
                <div className="flex">
                  <button
                    type="submit"
                    className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                  >
                    <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                    {t('txns:filter.filter') || 'Filter'}
                  </button>
                  <button
                    name="from"
                    type="button"
                    onClick={onClear}
                    className="flex-1 rounded bg-gray-300 text-xs h-7"
                  >
                    {t('txns:filter.clear') || 'Clear'}
                  </button>
                </div>
              </form>
            </MenuList>
          </Menu>
        </>
      ),
      key: 'predecessor_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            label={row.predecessor_account_id}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <span
              className={`align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                row?.predecessor_account_id === address
                  ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                  : 'text-green-500 dark:text-green-250 border-transparent'
              }`}
            >
              <Link
                href={`/address/${row.predecessor_account_id}`}
                className="text-green-500 dark:text-green-250 hover:no-underline"
                onMouseOver={(e) =>
                  onHandleMouseOver(e, row?.predecessor_account_id)
                }
                onMouseLeave={handleMouseLeave}
              >
                {truncateString(row.predecessor_account_id, 15, '...')}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-44',
    },
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => {
        return row.predecessor_account_id === row.receiver_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 flex items-center justify-center bg-green-200 dark:bg-nearblue-650/[0.15] dark:text-neargray-650 dark:border dark:border-nearblue-650/[0.25] text-white text-xs font-semibold">
            {t('txns:txnSelf') || 'SELF'}
          </span>
        ) : id === row.predecessor_account_id ? (
          <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60 text-yellow-700 text-xs font-semibold">
            {t('txns:txnOut') || 'OUT'}
          </span>
        ) : (
          <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-neargreen dark:bg-green-500/[0.15] dark:text-neargreen-300 dark:border dark:border-green-400/75 text-white text-xs font-semibold">
            {t('txns:txnIn') || 'IN'}
          </span>
        );
      },
    },
    {
      header: (
        <>
          <Menu>
            <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
              {t('txns:to') || 'To'}{' '}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </MenuButton>
            <MenuList className="z-50 bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 rounded-b-lg p-2">
              <form onSubmit={onFilter} className="flex flex-col">
                <input
                  name="to"
                  value={form.to}
                  onChange={onChange}
                  placeholder={
                    t('txns:filter.placeholder') || 'Search by address e.g. Ⓝ..'
                  }
                  className="border dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                />
                <div className="flex">
                  <button
                    type="submit"
                    className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                  >
                    <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                    {t('txns:filter.filter') || 'Filter'}
                  </button>
                  <button
                    name="to"
                    type="button"
                    onClick={onClear}
                    className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-white text-xs h-7"
                  >
                    {t('txns:filter.clear') || 'Clear'}
                  </button>
                </div>
              </form>
            </MenuList>
          </Menu>
        </>
      ),
      key: 'receiver_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            label={row.receiver_account_id}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <span
              className={`align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                row?.receiver_account_id === address
                  ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                  : 'text-green-500 dark:text-green-250 border-transparent'
              }`}
            >
              <Link
                href={`/address/${row.receiver_account_id}`}
                className="text-green-500 dark:text-green-250 hover:no-underline"
                onMouseOver={(e) =>
                  onHandleMouseOver(e, row?.receiver_account_id)
                }
                onMouseLeave={handleMouseLeave}
              >
                {truncateString(row.receiver_account_id, 15, '...')}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-44',
    },
    {
      header: <span>{t('txns:blockHeight') || ' BLOCK HEIGHT'}</span>,
      key: 'block_height',
      cell: (row: TransactionInfo) => (
        <span>
          <Link
            href={`/blocks/${row.included_in_block_hash}`}
            className="text-green-500  dark:text-green-250 hover:no-underline"
          >
            {row.block?.block_height
              ? localFormat(row.block?.block_height)
              : ''}
          </Link>
        </span>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: (
        <div className="w-full inline-flex px-4 py-4">
          <Tooltip
            label={
              showAge
                ? 'Click to show Datetime Format'
                : 'Click to show Age Format'
            }
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <button
              type="button"
              onClick={toggleShowAge}
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
            >
              {showAge
                ? t('txns:age') || 'AGE'
                : t('txns:ageDT') || 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
          <button type="button" onClick={onOrder} className="px-2">
            <div className="text-nearblue-600 font-semibold">
              <SortIcon order={order as string} />
            </div>
          </button>
        </div>
      ),
      key: 'block_timestamp',
      cell: (row: TransactionInfo) => (
        <span>
          <TimeStamp timestamp={row?.block_timestamp} showAge={showAge} />
        </span>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: 'whitespace-nowrap',
    },
  ];

  const uniqueIds: any = txns !== undefined && [
    ...new Set(txns?.map((transaction: any) => transaction?.transaction_hash)),
  ];

  const filterTxns = showAllReceipts
    ? txns
    : txns !== undefined
    ? uniqueIds?.map((id: string) => {
        const filteredTransactions = txns?.filter(
          (transaction: any) => transaction?.transaction_hash === id,
        );
        const lastRow = filteredTransactions[filteredTransactions.length - 1];
        return lastRow;
      })
    : txns;
  function removeCursor() {
    const queryParams = QueryString.parse(searchParams?.toString() || '');
    const { cursor, order, p, tab, ...rest } = queryParams;
    return rest;
  }
  const modifiedFilter = removeCursor();

  return (
    <>
      <div className={`flex flex-col lg:flex-row pt-4`}>
        <div className="flex flex-col">
          <p className="leading-7 pl-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
            {txns &&
              Object?.keys(txns)?.length > 0 &&
              `A total of${' '}
              ${count ? localFormat && localFormat(count?.toString()) : 0}${' '}
              transactions found`}
          </p>
        </div>
        <div className="flex flex-col px-4 text-sm mb-4 text-nearblue-600 dark:text-neargray-10 lg:flex-row lg:ml-auto lg:items-center lg:justify-between">
          <Filters filters={modifiedFilter} onClear={onAllClear} />
          <div className="flex items-center space-x-4">
            {txns && Object?.keys(txns)?.length > 0 && (
              <>
                <button className="hover:no-underline">
                  <Link
                    href={`/exportdata?address=${id}`}
                    className="flex items-center text-nearblue-600 dark:text-neargray-10 font-medium py-2 border border-neargray-700 dark:border-black-200 px-4 rounded-md bg-white dark:bg-black-600 hover:bg-neargray-800"
                  >
                    <p>CSV Export</p>
                    <span className="ml-2">
                      <Download />
                    </span>
                  </Link>
                </button>
                <div className="flex items-center space-x-2">
                  <Tooltip
                    label={`Toggle between Receipts Mode and All Receipts. The 'All Receipts' view shows all receipts, while the 'Receipts Mode' view only shows the last receipt of each transaction.`}
                    className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  >
                    <button className="hover:no-underline">
                      <Question className="w-4 h-4 fill-current mr-1" />
                    </button>
                  </Tooltip>
                  <label className="flex items-center space-x-2">
                    <SwitchButton
                      selected={showAllReceipts}
                      onChange={handleToggle}
                    />
                    <span className="text-nearblue-600 dark:text-neargray-10 text-[15px] leading-none pr-[15px]">
                      ALL RECEIPTS
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        data={filterTxns}
        limit={25}
        cursorPagination={true}
        cursor={cursor}
        page={page}
        setPage={setPage}
        Error={error}
        ErrorText={
          <ErrorMessage
            icons={<FaInbox />}
            message={errorMessage || ''}
            mutedText="Please try again later"
          />
        }
      />
    </>
  );
};

export default TransactionActions;
