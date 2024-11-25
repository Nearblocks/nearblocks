import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import { Tooltip } from '@reach/tooltip';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import { useState } from 'react';

import ErrorMessage from '@/components/common/ErrorMessage';
import TableSummary from '@/components/common/TableSummary';
import Clock from '@/components/Icons/Clock';
import FaInbox from '@/components/Icons/FaInbox';
import Skeleton from '@/components/skeleton/common/Skeleton';
import { Link } from '@/i18n/routing';
import { priceFormat } from '@/utils/app/libs';
import { localFormat, truncateString } from '@/utils/libs';
import { DexTransactionInfo } from '@/utils/types';

import dayjs from '../../../utils/dayjs';
import Filters from '../common/Filters';
import Table from '../common/Table';
import Filter from '../Icons/Filter';

interface Props {
  data: {
    cursor: string;
    txns: DexTransactionInfo[];
  };
  error: boolean;
  txnsCount: {
    txns: { count: string }[];
  };
}

const initialForm = {
  a: '',
};

export default function TokenTransfers({ data, error, txnsCount }: Props) {
  const [showAge, setShowAge] = useState(true);
  const errorMessage = ' No token transfers found!';
  const [address, setAddress] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const [form, setForm] = useState(initialForm);
  const count = txnsCount?.txns[0]?.count;
  const txns: DexTransactionInfo[] = data?.txns;
  const searchParams = useSearchParams();
  let cursor = data?.cursor;

  const toggleShowAge = () => setShowAge((s) => !s);

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();
    setAddress(id);
  };

  const handleMouseLeave = () => {
    setAddress('');
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'a') {
      return setForm((state) => ({
        ...state,
        [name]: value,
      }));
    }

    return setForm((f) => ({ ...f, [name]: value }));
  };

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { a } = form;
    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const { cursor, page, ...updatedQuery } = currentParams;

    const queryParams = {
      ...updatedQuery,
      ...(a && { a }),
    };

    const newQueryString = QueryString.stringify(queryParams);
    router.push(`${pathname}?${newQueryString}`);
  };

  const onClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;
    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const { cursor, page, ...restQuery } = currentParams;

    setForm((f) => ({ ...f, [name]: '' }));
    const { [name]: _, ...newQuery } = restQuery;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const onAllClear = () => {
    setForm(initialForm);

    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const { a, action, block, cursor, from, method, page, to, ...newQuery } =
      currentParams;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const columns: any = [
    {
      cell: (row: DexTransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={row?.receipt_id}
          >
            <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250">
              <Link
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                href={`/hash/${row?.receipt_id}`}
              >
                {row?.receipt_id}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: <span>Txn Hash</span>,
      key: 'hash',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexTransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={row?.type}
          >
            {row?.type === 'BUY' ? (
              <div className="text-neargreen flex flex-row items-center">
                {row?.amount_usd ? row?.type : ''}
              </div>
            ) : (
              <div className="text-red-500 flex flex-row items-center">
                {row?.amount_usd ? row?.type : ''}
              </div>
            )}
          </Tooltip>
        </span>
      ),
      header: <span>Type</span>,
      key: 'type',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexTransactionInfo) => (
        <span>
          {row?.amount_usd === null ? (
            <span className="text-xs">N/A</span>
          ) : row?.type === 'BUY' ? (
            <div className="text-neargreen flex flex-row items-center">
              {row?.amount_usd ? `$${priceFormat(row?.amount_usd)}` : ''}
            </div>
          ) : (
            <div className="text-red-500 flex flex-row items-center">
              {row?.amount_usd ? `$${priceFormat(row?.amount_usd)}` : ''}
            </div>
          )}
        </span>
      ),
      header: <span className="whitespace-nowrap">Amount(USD)</span>,
      key: 'amount_usd',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 w-60 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexTransactionInfo) => (
        <span>
          {row?.base_amount === null ? (
            <span className="text-xs">N/A</span>
          ) : row?.type === 'BUY' ? (
            <div className="text-neargreen flex flex-row items-center">
              {row?.base_amount ? `$${priceFormat(row?.base_amount)}` : ''}
            </div>
          ) : (
            <div className="text-red-500 flex flex-row items-center">
              {row?.base_amount ? `$${priceFormat(row?.base_amount)}` : ''}
            </div>
          )}
        </span>
      ),
      header: <span className="whitespace-nowrap">Base Amount</span>,
      key: 'base_amount',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 w-60 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexTransactionInfo) => (
        <span>
          {row?.quote_amount === null ? (
            <span className="text-xs">N/A</span>
          ) : row?.type === 'BUY' ? (
            <div className="text-neargreen flex flex-row items-center">
              {row?.quote_amount ? `$${priceFormat(row?.quote_amount)}` : ''}
            </div>
          ) : (
            <div className="text-red-500 flex flex-row items-center">
              {row?.quote_amount ? `$${priceFormat(row?.quote_amount)}` : ''}
            </div>
          )}
        </span>
      ),
      header: <span className="whitespace-nowrap">Quote Amount</span>,
      key: 'quote_amount',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 w-60 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexTransactionInfo) => (
        <span>
          {row?.price_usd === null ? (
            <span className="text-xs">N/A</span>
          ) : row?.type === 'BUY' ? (
            <div className="text-neargreen flex flex-row items-center">
              {row?.price_usd ? `$${priceFormat(row?.price_usd)}` : ''}
            </div>
          ) : (
            <div className="text-red-500 flex flex-row items-center">
              {row?.price_usd ? `$${priceFormat(row?.price_usd)}` : ''}
            </div>
          )}
        </span>
      ),
      header: <span className="whitespace-nowrap">Price(USD)</span>,
      key: 'price_usd',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 w-60 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexTransactionInfo) => (
        <span>
          {row?.price_token === null ? (
            <span className="text-xs">N/A</span>
          ) : row?.type === 'BUY' ? (
            <div className="text-neargreen flex flex-row items-center">
              {row?.price_token ? `$${priceFormat(row?.price_token)}` : ''}
            </div>
          ) : (
            <div className="text-red-500 flex flex-row items-center">
              {row?.price_token ? `$${priceFormat(row?.price_token)}` : ''}
            </div>
          )}
        </span>
      ),
      header: <span className="whitespace-nowrap">Token Price</span>,
      key: 'price_token',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 w-60 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexTransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={row.maker}
          >
            <span
              className={`align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                row?.maker === address
                  ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                  : 'text-green-500 dark:text-green-250 border-transparent'
              }`}
            >
              <Link
                className="text-green-500 dark:text-green-250 hover:no-underline"
                href={`/address/${row.maker}`}
                onMouseLeave={handleMouseLeave}
                onMouseOver={(e) => onHandleMouseOver(e, row?.maker)}
              >
                {truncateString(row.maker, 15, '...')}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <>
          <Menu>
            <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
              Maker <Filter className="h-4 w-4 fill-current ml-2" />
            </MenuButton>
            <MenuList className="z-50 bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 rounded-b-lg p-2">
              <form className="flex flex-col" onSubmit={onFilter}>
                <input
                  className="border dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                  name="a"
                  onChange={onChange}
                  placeholder={'Search by maker e.g. Ⓝ..'}
                  value={form.a}
                />
                <div className="flex">
                  <button
                    className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                    type="submit"
                  >
                    <Filter className="h-3 w-3 fill-current mr-2" /> {'Filter'}
                  </button>
                  <button
                    className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-white text-xs h-7"
                    name="to"
                    onClick={onClear}
                    type="button"
                  >
                    {'Clear'}
                  </button>
                </div>
              </form>
            </MenuList>
          </Menu>
        </>
      ),
      key: 'receiver_account_id',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-44',
    },
    {
      cell: (row: DexTransactionInfo) => (
        <span className="w-48">
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
            label={
              showAge
                ? row?.timestamp
                  ? dayjs(row?.timestamp * 1000)
                      .utc()
                      .format('YYYY-MM-DD HH:mm:ss')
                  : ''
                : row?.timestamp
                ? dayjs(row?.timestamp * 1000).fromNow()
                : ''
            }
          >
            <span>
              {!showAge
                ? row?.timestamp
                  ? dayjs(row?.timestamp * 1000)
                      .utc()
                      .format('YYYY-MM-DD HH:mm:ss')
                  : ''
                : row?.timestamp
                ? dayjs(row?.timestamp * 1000).fromNow()
                : ''}
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <div className="w-48">
          <Tooltip
            className="absolute h-auto max-w-[8rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={
              showAge
                ? 'Click to show Datetime Format'
                : 'Click to show Age Format'
            }
          >
            <button
              className="w-full flex items-center px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex-row"
              onClick={toggleShowAge}
              type="button"
            >
              {showAge ? (
                <>
                  AGE
                  <Clock className="text-green-500 dark:text-green-250 ml-2" />
                </>
              ) : (
                'DATE TIME (UTC)'
              )}
            </button>
          </Tooltip>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
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
      {!count ? (
        <div className="pl-3 max-w-sm py-5 h-[60px]">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <TableSummary
          filters={<Filters filters={modifiedFilter} onClear={onAllClear} />}
          text={
            txns &&
            !error &&
            `A total of ${
              count ? localFormat && localFormat(count.toString()) : 0
            }${' '}
          transactions found`
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
            message={errorMessage}
            mutedText="Please try again later"
          />
        }
        limit={25}
      />
    </>
  );
}
