'use client';
import { localFormat, truncateString } from '@/utils/libs';
import { TransactionInfo } from '@/utils/types';
import { useState } from 'react';
import TxnStatus from '../common/Status';
import { Tooltip } from '@reach/tooltip';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import Filter from '../Icons/Filter';
import Clock from '../Icons/Clock';
import SortIcon from '../Icons/SortIcon';
import Filters from '../common/Filters';
import Download from '../Icons/Download';
import Table from '../common/Table';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import TokenImage from '../common/TokenImage';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import TableSummary from '@/components/common/TableSummary';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const initialForm = {
  event: '',
  involved: '',
};

interface NftTokenTxnsProps {
  id: string;
  txns: TransactionInfo[];
  count: string;
  error: boolean;
  cursor: string;
  // tab: string;
}

const TimeStamp = dynamic(() => import('../common/TimeStamp'), { ssr: false });

const NFTTransactionActions = ({
  id,
  txns,
  count,
  error,
  cursor, //   tab,
}: NftTokenTxnsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const order = searchParams?.get('order');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [showAge, setShowAge] = useState(true);
  const [address, setAddress] = useState('');
  const t = useTranslations();
  const errorMessage = t('noTxns') || ' No transactions found!';
  const toggleShowAge = () => setShowAge((s) => !s);

  const onChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;

    setForm((f) => ({ ...f, [name]: value }));
  };

  const onOrder = () => {
    const currentOrder = searchParams?.get('order') || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const newParams = { ...currentParams, order: newOrder };
    const newQueryString = QueryString.stringify(newParams);

    router.push(`${pathname}?${newQueryString}`);
  };

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);

    const { event, involved } = form;
    const currentParams = QueryString.parse(searchParams?.toString() || '');
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
    const currentParams = QueryString.parse(searchParams?.toString() || '');
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

    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const { cursor, event, page, involved, ...newQuery } = currentParams;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };

  const columns = [
    {
      header: '',
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus status={row?.outcomes?.status} showLabel={false} />
        </>
      ),
      tdClassName:
        'pl-5 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <>{t('hash') || 'TXN HASH'}</>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            label={row.transaction_hash}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          >
            <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap">
              <Link
                href={`/txns/${row?.transaction_hash}`}
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
              >
                {row?.transaction_hash}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: (
        <Menu>
          <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider focus:outline-none">
            {t('type') || 'METHOD'}{' '}
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="bg-white shadow-lg border rounded-b-lg p-2">
            <form onSubmit={onFilter} className="flex flex-col">
              <input
                name="event"
                value={form.event}
                onChange={onChange}
                placeholder="Search by method"
                className="border rounded h-8 mb-2 px-2 text-gray-500 text-xs"
              />
              <div className="flex">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t('filter.filter') || 'Filter'}
                </button>
                <button
                  name="event"
                  type="button"
                  onClick={onClear}
                  className="flex-1 rounded bg-gray-300 text-xs h-7"
                >
                  {t('filter.clear') || 'Clear'}
                </button>
              </div>
            </form>
          </MenuList>
        </Menu>
      ),
      key: 'cause',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            label={row?.cause}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <>Affected</>,
      key: 'affected_account_id',
      cell: (row: TransactionInfo) => (
        <>
          {row?.affected_account_id ? (
            <Tooltip
              label={row?.affected_account_id}
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            >
              <span
                className={`inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                  row?.affected_account_id === address
                    ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                    : 'text-green-500 dark:text-green-250 border-transparent'
                }`}
              >
                <Link
                  href={`/address/${row?.affected_account_id}`}
                  className="text-green-500 dark:text-green-250 hover:no-underline"
                  onMouseOver={(e) =>
                    onHandleMouseOver(e, row?.affected_account_id)
                  }
                  onMouseLeave={handleMouseLeave}
                >
                  {truncateString(row?.affected_account_id, 15, '...')}
                </Link>
              </span>
            </Tooltip>
          ) : (
            'system'
          )}
        </>
      ),
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10  font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: '',
      key: '',
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
      tdClassName: 'text-center',
    },
    {
      header: (
        <Menu>
          <MenuButton className="flex items-center px-2 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
            Involved
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="z-50 bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 rounded-b-lg p-2">
            <form onSubmit={onFilter} className="flex flex-col">
              <input
                name="involved"
                value={form.involved}
                onChange={onChange}
                placeholder={
                  t('filter.placeholder') || 'Search by address e.g. Ⓝ..'
                }
                className="border dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
              />
              <div className="flex">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t('filter.filter') || 'Filter'}
                </button>
                <button
                  name="involved"
                  type="button"
                  onClick={onClear}
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-white text-xs h-7"
                >
                  {t('filter.clear') || 'Clear'}
                </button>
              </div>
            </form>
          </MenuList>
        </Menu>
      ),
      key: 'involved_account_id',
      cell: (row: TransactionInfo) => (
        <>
          {row.involved_account_id ? (
            <Tooltip
              label={row.involved_account_id}
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            >
              <span>
                <Link
                  href={`/address/${row.involved_account_id}`}
                  className={`text-green-500 dark:text-green-250 hover:no-underline p-0.5 px-1 border rounded-md whitespace-nowrap ${
                    row?.involved_account_id === address
                      ? ' bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                      : 'text-green-500 dark:text-green-250 hover:no-underline border-transparent'
                  }`}
                  onMouseOver={(e) =>
                    onHandleMouseOver(e, row?.involved_account_id)
                  }
                  onMouseLeave={handleMouseLeave}
                >
                  {truncateString(row.involved_account_id, 15, '...')}
                </Link>
              </span>
            </Tooltip>
          ) : (
            'system'
          )}
        </>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600  font-medium dark:text-neargray-10',
      thClassName:
        'text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <>Token ID</>,
      key: 'token_id',
      cell: (row: TransactionInfo) => (
        <Tooltip
          label={row?.token_id}
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
        >
          <span>
            <Link
              href={`/nft-token/${row?.nft?.contract}/${row?.token_id}`}
              className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
            >
              {truncateString(row?.token_id, 15, '...')}
            </Link>
          </span>
        </Tooltip>
      ),
      tdClassName:
        'px-4 py-3 items-center my-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider',
    },
    {
      header: <>Token</>,
      key: 'block_height',
      cell: (row: TransactionInfo) => {
        return (
          row?.nft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  src={row?.nft?.icon}
                  alt={row?.nft?.name}
                  className="w-4 h-4"
                />
              </span>
              <Tooltip
                label={row?.nft?.name}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
              >
                <div className="text-sm text-nearblue-600 dark:text-neargray-10 max-w-[110px] inline-block truncate whitespace-nowrap">
                  <Link
                    href={`/nft-token/${row?.nft?.contract}`}
                    className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                  >
                    {row?.nft?.name}
                  </Link>
                </div>
              </Tooltip>

              {row?.nft?.symbol && (
                <Tooltip
                  label={row?.nft?.symbol}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                >
                  <div className="text-sm text-nearblue-700 max-w-[80px] inline-block truncate whitespace-nowrap">
                    &nbsp; {row?.nft?.symbol}
                  </div>
                </Tooltip>
              )}
            </div>
          )
        );
      },
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider',
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
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          >
            <button
              type="button"
              onClick={toggleShowAge}
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
            >
              {showAge ? t('age') || 'AGE' : t('ageDT') || 'DATE TIME (UTC)'}
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

  function removeCursor() {
    const queryParams = QueryString.parse(searchParams?.toString() || '');
    const { cursor, order, page, tab, ...rest } = queryParams;
    return rest;
  }
  const modifiedFilter = removeCursor();
  return (
    <>
      <TableSummary
        text={
          txns &&
          !error &&
          `A total of ${
            count ? localFormat && localFormat(count.toString()) : 0
          }${' '}
        transactions found`
        }
        filters={<Filters filters={modifiedFilter} onClear={onAllClear} />}
        linkToDowload={
          txns &&
          txns.length > 0 && (
            <button className="hover:no-underline ">
              <Link
                href={`/nft-token/exportdata?address=${id}`}
                className="flex items-center text-nearblue-600 dark:text-neargray-10 font-medium py-2 border dark:border-black-200 border-neargray-700 px-4 rounded-md bg-white dark:bg-black-600  hover:bg-neargray-800"
              >
                <p>CSV Export</p>
                <span className="ml-2">
                  <Download />
                </span>
              </Link>
            </button>
          )
        }
      />
      <Table
        columns={columns}
        data={txns}
        limit={25}
        cursorPagination={true}
        cursor={cursor}
        page={page}
        setPage={setPage}
        Error={error}
        ErrorText={
          <ErrorMessage
            icons={<FaInbox />}
            message={errorMessage}
            mutedText="Please try again later"
          />
        }
      />
    </>
  );
};

export default NFTTransactionActions;
