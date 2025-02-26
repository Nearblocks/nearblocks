'use client';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import { useState } from 'react';

import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Link } from '@/i18n/routing';
import { localFormat, truncateString } from '@/utils/libs';
import { FilterKind, TransactionInfo } from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import Filters from '../common/Filters';
import TxnStatus from '../common/Status';
import Table from '../common/Table';
import TableSummary from '../common/TableSummary';
import TokenImage from '../common/TokenImage';
import Tooltip from '../common/Tooltip';
import Clock from '../Icons/Clock';
import Download from '../Icons/Download';
import FaInbox from '../Icons/FaInbox';
import Filter from '../Icons/Filter';
import SortIcon from '../Icons/SortIcon';
import { getFilteredQueryParams } from '@/utils/app/libs';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import { CopyButton } from '../common/CopyButton';

interface NftTokenTxnsProps {
  count: string;
  cursor: string;
  error: boolean;
  id: string;
  txns: TransactionInfo[];
  // tab: string;
}

const TimeStamp = dynamic(() => import('../common/TimeStamp'), { ssr: false });

const NFTTransactionActions = ({
  count,
  cursor, //   tab,
  error,
  id,
  txns,
}: NftTokenTxnsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const order = searchParams?.get('order');
  const [page, setPage] = useState(1);
  const initialForm = {
    event: searchParams?.get('event') || '',
    involved: searchParams?.get('involved') || '',
    contract: searchParams?.get('contract') || '',
  };
  const [form, setForm] = useState(initialForm);
  const [showAge, setShowAge] = useState(true);
  const t = useTranslations();
  const errorMessage = t('noTxns') || ' No transactions found!';
  const toggleShowAge = () => setShowAge((s) => !s);
  const currentParams = QueryString.parse(searchParams?.toString() || '');

  const onChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;

    setForm((f) => ({ ...f, [name]: value }));
  };

  const onOrder = () => {
    const currentOrder = searchParams?.get('order') || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    const newParams = { ...currentParams, order: newOrder };
    const newQueryString = QueryString.stringify(newParams);

    router.push(`${pathname}?${newQueryString}`);
  };

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);

    const { event, involved, contract } = form;
    const { cursor, page, ...updatedQuery } = currentParams;

    const queryParams = {
      ...updatedQuery,
      ...(event && { event }),
      ...(involved && { involved }),
      ...(contract && { contract }),
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
    const { cursor, event, involved, contract, page, ...newQuery } =
      currentParams;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const columns = [
    {
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus showLabel={false} status={row?.outcomes?.status} />
        </>
      ),
      header: '',
      key: '',
      tdClassName:
        'pl-5 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row.transaction_hash}
          >
            <AddressOrTxnsLink
              copy
              className={
                'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
              }
              txnHash={row.transaction_hash}
            />
          </Tooltip>
        </span>
      ),
      header: <>{t('hash') || 'TXN HASH'}</>,
      key: 'transaction_hash',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
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
            className="bg-white dark:bg-black-600 dark:border-black-200 shadow-lg border p-2 z-20"
            marginTop={-1.5}
            roundedBottom={'lg'}
            roundedTop={'none'}
            width={'48'}
          >
            <form className="flex flex-col" onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-gray-500 dark:text-neargray-10  text-xs"
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
      ),
      key: 'cause',
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <>
          {row?.affected_account_id ? (
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row?.affected_account_id}
            >
              <span>
                <AddressOrTxnsLink
                  copy
                  className={'inline-block align-bottom whitespace-nowrap'}
                  currentAddress={row?.affected_account_id}
                />
              </span>
            </Tooltip>
          ) : (
            'system'
          )}
        </>
      ),
      header: <>Affected</>,
      key: 'affected_account_id',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10  font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
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
        <>
          {row.involved_account_id ? (
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row.involved_account_id}
            >
              <span>
                <AddressOrTxnsLink
                  copy
                  className={'inline-block align-bottom whitespace-nowrap'}
                  currentAddress={row?.involved_account_id}
                />
              </span>
            </Tooltip>
          ) : (
            'system'
          )}
        </>
      ),
      header: (
        <PopoverRoot>
          <PopoverTrigger
            asChild
            className="flex items-center px-2 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
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
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-white text-xs h-7"
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
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600  font-medium dark:text-neargray-10',
      thClassName:
        'text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <Tooltip
          className={'left-1/2 max-w-[200px]'}
          position="top"
          tooltip={row?.token_id}
        >
          <span>
            <Link
              className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
              href={`/nft-token/${row?.nft?.contract}/${row?.token_id}`}
            >
              {truncateString(row?.token_id, 15, '...')}
            </Link>
          </span>
        </Tooltip>
      ),
      header: <>Token ID</>,
      key: 'token_id',
      tdClassName:
        'px-4 py-3 items-center my-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => {
        return (
          row?.nft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  alt={row?.nft?.name}
                  className="w-4 h-4"
                  src={row?.nft?.icon}
                />
              </span>
              <Tooltip
                className={'left-1/2 max-w-[200px] whitespace-nowrap'}
                position="top"
                tooltip={row?.nft?.name}
              >
                <div className="text-sm text-nearblue-600 dark:text-neargray-10 max-w-[110px] inline-flex truncate whitespace-nowrap">
                  <Link
                    className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                    href={`/nft-token/${row?.nft?.contract}`}
                  >
                    {row?.nft?.name}
                  </Link>
                </div>
              </Tooltip>
              <CopyButton textToCopy={row?.nft?.contract} />
              {row?.nft?.symbol && (
                <Tooltip
                  className={'left-1/2 max-w-[200px]'}
                  position="top"
                  tooltip={row?.nft?.symbol}
                >
                  <div className="text-sm text-nearblue-700 max-w-[80px] inline-flex truncate whitespace-nowrap">
                    &nbsp; {row?.nft?.symbol}
                  </div>
                </Tooltip>
              )}
            </div>
          )
        );
      },
      header: (
        <PopoverRoot>
          <PopoverTrigger
            asChild
            className="flex items-center text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
          >
            <button>
              Token
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 p-2 z-20"
            marginTop={3}
            marginLeft={20}
            roundedBottom={'lg'}
            roundedTop={'none'}
            width={'48'}
          >
            <form className="flex flex-col" onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 focus:outline-blue dark:focus:outline-none dark:focus:ring-2 dark:focus:ring-gray-800 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                name="contract"
                onChange={onChange}
                placeholder={t('tokenPlaceholder') || 'Search by token'}
                value={form.contract}
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
                  name="contract"
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
      key: 'token',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider',
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
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
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
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
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
    FilterKind.EVENT,
    FilterKind.INVOLVED,
    FilterKind.CONTRACT,
  ]);

  return (
    <>
      <TableSummary
        filters={<Filters filters={modifiedFilter} onClear={onAllClear} />}
        linkToDowload={
          txns &&
          txns.length > 0 && (
            <button className="hover:no-underline ">
              <Link
                className="flex items-center text-nearblue-600 h-7 dark:text-neargray-10 gap-x-1 font-medium py-1 px-2.5 border border-neargray-700 dark:border-black-200 rounded-md bg-white dark:bg-black-600 hover:bg-neargray-800 whitespace-nowrap text-xs"
                href={`/nft-token/exportdata?address=${id}`}
              >
                <span>
                  <Download />
                </span>
                <p className="-mb-0.5">CSV Export</p>
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

export default NFTTransactionActions;
