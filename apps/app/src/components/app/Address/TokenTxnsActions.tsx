'use client';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import { useState } from 'react';

import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Link } from '@/i18n/routing';
import { getFilteredQueryParams, localFormat } from '@/utils/app/libs';
import { tokenAmount } from '@/utils/app/near';
import { FilterKind, TransactionInfo } from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import Filters from '../common/Filters';
import TxnStatus from '../common/Status';
import Table from '../common/Table';
import TableSummary from '../common/TableSummary';
import TimeStamp from '../common/TimeStamp';
import TokenImage from '../common/TokenImage';
import Tooltip from '../common/Tooltip';
import Clock from '../Icons/Clock';
import Download from '../Icons/Download';
import FaInbox from '../Icons/FaInbox';
import Filter from '../Icons/Filter';
import SortIcon from '../Icons/SortIcon';
import { AddressDisplay } from '@/components/app/common/HoverContextProvider';

const initialForm = {
  event: '',
  involved: '',
};

interface TokenTxnsProps {
  count: string;
  cursor: string;
  error: boolean;
  id: string;
  txns: TransactionInfo[];
}

const TokenTxnsActions = ({
  count,
  cursor,
  error,
  id,
  txns,
}: TokenTxnsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const order = searchParams?.get('order');
  const [showAge, setShowAge] = useState(true);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const t = useTranslations();
  const errorMessage = t('noTxns') || 'No transactions found!';

  const currentParams = QueryString.parse(searchParams?.toString() || '');

  const onOrder = () => {
    const currentOrder = searchParams?.get('order') || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    const newParams = { ...currentParams, order: newOrder };
    const newQueryString = QueryString.stringify(newParams);

    router.push(`${pathname}?${newQueryString}`);
  };

  const toggleShowAge = () => setShowAge((s) => !s);

  const onChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);

    const { event, involved } = form;
    const { cursor, page, ...updatedQuery } = currentParams;

    const queryParams = {
      ...updatedQuery,
      ...(event && { event }),
      ...(involved && { involved }),
    };

    const newQueryString = QueryString.stringify(queryParams);
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
    const { cursor, event, involved, page, ...newQuery } = currentParams;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const columns = [
    {
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus showLabel={false} status={row.outcomes.status} />
        </>
      ),
      header: '',
      key: '',
      tdClassName:
        'pl-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <span className="relative">
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row.transaction_hash}
          >
            <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
              <Link
                className="text-green-500 font-medium"
                href={`/txns/${row.transaction_hash}`}
              >
                {row.transaction_hash}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: <>{t('hash') || 'TXN HASH'}</>,
      key: 'transaction_hash',
      tdClassName: 'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.cause}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <>
          <PopoverRoot>
            <PopoverTrigger
              asChild
              className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
            >
              <button>
                {t('type') || 'METHOD'}{' '}
                <Filter className="h-4 w-4 fill-current ml-2" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 p-2 z-20"
              marginTop={-1.5}
              roundedBottom={'lg'}
              roundedTop={'none'}
              width={'48'}
            >
              <form className="flex flex-col" onSubmit={onFilter}>
                <input
                  className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                  name="event"
                  onChange={onChange}
                  placeholder="Search by method"
                  value={form.event}
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
                    name="event"
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
      key: 'cause',
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          {row?.affected_account_id ? (
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row?.affected_account_id}
            >
              <span>
                <AddressDisplay
                  copy
                  className={'inline-flex align-bottom whitespace-nowrap'}
                  currentAddress={row?.affected_account_id}
                />
              </span>
            </Tooltip>
          ) : (
            'system'
          )}
        </span>
      ),
      header: <>Affected</>,
      key: 'affected_account_id',
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <>
          {row.involved_account_id === row.affected_account_id ? (
            <span className="uppercase rounded w-10 py-2 h-6 flex items-center justify-center bg-green-200 dark:bg-nearblue-650/[0.15] dark:text-neargray-650 dark:border dark:border-nearblue-650/[0.25] text-white text-xs font-semibold">
              {t('txnSelf') || 'SELF'}
            </span>
          ) : Number(row?.delta_amount) < 0 ? (
            <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60 text-yellow-700 text-xs font-semibold">
              {t('txnOut') || 'OUT'}
            </span>
          ) : (
            <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-neargreen dark:bg-green-500/[0.15] dark:text-neargreen-300 dark:border dark:border-green-400/75 text-white text-xs font-semibold">
              {t('txnIn') || 'IN'}
            </span>
          )}
        </>
      ),
      header: '',
      key: '',
      tdClassName: 'text-center',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          {row.involved_account_id ? (
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row.involved_account_id}
            >
              <span>
                <AddressDisplay
                  copy
                  className={'inline-flex align-bottom whitespace-nowrap'}
                  currentAddress={row?.involved_account_id}
                />
              </span>
            </Tooltip>
          ) : (
            'system'
          )}
        </span>
      ),
      header: (
        <PopoverRoot>
          <PopoverTrigger
            asChild
            className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
          >
            <button>
              Involved
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 p-2 z-20"
            marginTop={-1.5}
            roundedBottom={'lg'}
            roundedTop={'none'}
            width={'48'}
          >
            <form className="flex flex-col" onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                name="involved"
                onChange={onChange}
                placeholder={
                  t('filter.placeholder') || 'Search by address e.g. Ⓝ..'
                }
                value={form.involved}
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
                  name="involved"
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
      key: 'involved_account_id',
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10  font-medium',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          {Number(row?.delta_amount) > 0 ? (
            <div className="text-neargreen flex flex-row items-center">
              {'+' +
                localFormat(
                  tokenAmount(row?.delta_amount, row?.ft?.decimals, true),
                )}
            </div>
          ) : (
            <div className="text-red-500 flex flex-row items-center">
              {row?.delta_amount
                ? localFormat(
                    tokenAmount(row?.delta_amount, row?.ft?.decimals, true),
                  )
                : ''}
            </div>
          )}
        </span>
      ),
      header: <>Quantity</>,
      key: 'block_height',
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10  font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => {
        return (
          row?.ft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  alt={row?.ft?.name}
                  className="w-4 h-4"
                  src={row?.ft?.icon}
                />
              </span>
              <Tooltip
                className={'left-1/2 max-w-[200px] whitespace-nowrap'}
                position="top"
                tooltip={row?.ft?.name}
              >
                <div className="text-sm text-nearblue-600 dark:text-neargray-10  max-w-[110px] inline-flex truncate whitespace-nowrap">
                  <Link
                    className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                    href={`/token/${row?.ft?.contract}`}
                  >
                    {row?.ft?.name}
                  </Link>
                </div>
              </Tooltip>
              {row?.ft?.symbol && (
                <Tooltip
                  className={'left-1/2 max-w-[200px]'}
                  position="top"
                  tooltip={row?.ft.symbol}
                >
                  <div className="text-sm text-nearblue-700 max-w-[80px] inline-flex truncate">
                    &nbsp; {row?.ft.symbol}
                  </div>
                </Tooltip>
              )}
            </div>
          )
        );
      },
      header: <>Token</>,
      key: 'block_height',
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
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
              className="text-left text-xs w-full inline-flex items-center font-semibold uppercase tracking-wider  text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
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
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: 'whitespace-nowrap',
    },
  ];

  const modifiedFilter = getFilteredQueryParams(currentParams, [
    FilterKind.EVENT,
    FilterKind.INVOLVED,
  ]);

  return (
    <>
      <TableSummary
        filters={<Filters filters={modifiedFilter} onClear={onAllClear} />}
        linkToDowload={
          txns &&
          txns?.length > 0 && (
            <button className="hover:no-underline ">
              <Link
                className="flex items-center text-nearblue-600 dark:text-neargray-10 font-medium py-2 border border-neargray-700 dark:border-black-200 px-4 rounded-md bg-white dark:bg-black-600 hover:bg-neargray-800 whitespace-nowrap"
                href={`/token/exportdata?address=${id}`}
              >
                <p>CSV Export</p>
                <span className="ml-2">
                  <Download />
                </span>
              </Link>
            </button>
          )
        }
        text={
          txns &&
          !error &&
          `A total of ${
            count ? localFormat && localFormat(count.toString()) : 0
          }${' '}
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
            message={errorMessage}
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

export default TokenTxnsActions;
