import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import { Tooltip } from '@reach/tooltip';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { Link, useIntlRouter, usePathname } from '@/i18n/routing';
import {
  isAction,
  localFormat,
  truncateString,
  yoctoToNear,
} from '@/utils/libs';
import { TransactionInfo } from '@/utils/types';

import { txnMethod } from '../../utils/near';
import ErrorMessage from '../common/ErrorMessage';
import Filters from '../common/Filters';
import TxnStatus from '../common/Status';
import Table from '../common/Table';
import TimeStamp from '../common/TimeStamp';
import Clock from '../Icons/Clock';
import FaInbox from '../Icons/FaInbox';
import FaLongArrowAltRight from '../Icons/FaLongArrowAltRight';
import Filter from '../Icons/Filter';
import SortIcon from '../Icons/SortIcon';

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

const initialForm = {
  action: '',
  from: '',
  method: '',
  to: '',
};

const List = ({ error, txnsCount, txnsData }: ListProps) => {
  const t = useTranslations();
  const router = useRouter();
  const intlRouter = useIntlRouter();
  const pathname = usePathname();
  const [showAge, setShowAge] = useState(true);
  const [address, setAddress] = useState('');
  const [form, setForm] = useState(initialForm);
  const [page, setPage] = useState(1);
  const errorMessage = t ? t('noTxns') : ' No transactions found!';

  const count = txnsCount?.txns[0]?.count;
  const txns = txnsData?.txns;
  let cursor = txnsData?.cursor;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e?.target;
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
    const { query } = router;
    const { cursor, locale, p, ...updatedQuery } = query;

    const queryParams = {
      ...(action && { action }),
      ...(method && { method }),
      ...(from && { from }),
      ...(to && { to }),
    };

    const finalQuery = { ...updatedQuery, ...queryParams };

    // @ts-ignore: Unreachable code error
    intlRouter.push({ pathname, query: finalQuery });
  };

  const onClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;

    setPage(1);
    const { cursor, locale, p, ...restQuery } = router.query;

    if (name === 'type') {
      setForm((prev) => ({ ...prev, action: '', method: '' }));
      const { action, locale, method, ...newQuery } = restQuery;

      // @ts-ignore: Unreachable code error
      intlRouter.push({
        pathname: pathname,
        query: newQuery,
      });
      return;
    } else {
      setForm((f) => ({ ...f, [name]: '' }));
      const { [name]: _, ...newQuery } = restQuery;

      // @ts-ignore: Unreachable code error
      intlRouter.push({
        pathname: pathname,
        query: newQuery,
      });
    }

    setPage(1);
  };

  const onAllClear = () => {
    setForm(initialForm);

    const {
      action,
      block,
      cursor,
      from,
      locale,
      method,
      order,
      p,
      to,
      ...newQuery
    } = router.query;

    // @ts-ignore: Unreachable code error
    intlRouter.push({
      pathname: pathname,
      query: newQuery,
    });
  };

  const onOrder = () => {
    const { query } = router;
    const { cursor, locale, order, p, ...updatedQuery } = query;
    const currentOrder = order ?? 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

    // @ts-ignore: Unreachable code error
    intlRouter.push({
      pathname: pathname,
      query: {
        ...updatedQuery,
        order: newOrder,
      },
    });
  };

  const onHandleMouseOver = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setAddress(id);
  };

  const handleMouseLeave = () => {
    setAddress('');
  };

  function removeCursor() {
    const queryParams = router.query;
    const { cursor, filter, keyword, locale, order, p, query, ...rest } =
      queryParams;
    return rest;
  }

  const modifiedFilter = removeCursor();

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
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={row?.transaction_hash}
          >
            <span className="truncate max-w-[120px] inline-block align-bottom whitespace-nowrap text-green-500 dark:text-green-250">
              <Link
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                href={`/txns/${row?.transaction_hash}`}
              >
                {row?.transaction_hash}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: <span>{t ? t('hash') : 'TXN HASH'}</span>,
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
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={txnMethod(row?.actions, t)}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">
                {txnMethod(row?.actions, t)}
              </span>
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <Menu>
          <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
            {t ? t('type') : 'METHOD'}
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="bg-white dark:bg-black-600 dark:border-black-200 shadow-lg border rounded-b-lg p-2 z-50">
            <form className="flex flex-col" onSubmit={onFilter}>
              <input
                className="border dark:border-black-200  rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                name="type"
                onChange={onChange}
                placeholder="Search by method"
                value={form?.action || form?.method}
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
                  name="type"
                  onClick={onClear}
                  type="button"
                >
                  {t ? t('filter.clear') : 'Clear'}
                </button>
              </div>
            </form>
          </MenuList>
        </Menu>
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
      header: <span>{t ? t('depositValue') : 'DEPOSIT VALUE'}</span>,
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
      header: <span>{t ? t('txnFee') : 'TXN FEE'}</span>,
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
            className="absolute h-auto max-w-xs bg-black  bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={row?.signer_account_id}
          >
            <span
              className={`truncate max-w-[120px] inline-block align-bottom border rounded-md p-0.5 px-1 text-green-500 dark:text-green-250 whitespace-nowrap ${
                row?.signer_account_id === address
                  ? ' bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                  : 'text-green-500 dark:text-green-250 border-transparent'
              }`}
            >
              <Link
                className="hover:no-underline"
                href={`/address/${row?.signer_account_id}`}
                onMouseLeave={handleMouseLeave}
                onMouseOver={(e) =>
                  onHandleMouseOver(e, row?.signer_account_id)
                }
              >
                {row?.signer_account_id}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <Menu>
          <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
            {t ? t('from') : 'FROM'}
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="bg-white dark:bg-black-600 dark:border-black-200 shadow-lg border rounded-b-lg p-2 z-50">
            <form onSubmit={onFilter}>
              <input
                className="border dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600  dark:text-neargray-10 text-xs"
                name="from"
                onChange={onChange}
                placeholder={
                  t ? t('filter.placeholder') : 'Search by address e.g. Ⓝ..'
                }
                value={form?.from}
              />
              <div className="flex">
                <button
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 dark:text-black h-7 text-white text-xs mr-2"
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
          </MenuList>
        </Menu>
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
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={row?.receiver_account_id}
          >
            <span>
              <Link
                className={`text-green-500 border rounded-md dark:text-green-250 p-1 hover:no-underline whitespace-nowrap ${
                  row?.receiver_account_id === address
                    ? ' bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                    : 'text-green-500 dark:text-green-250 border-transparent'
                }`}
                href={`/address/${row?.receiver_account_id}`}
                onMouseLeave={handleMouseLeave}
                onMouseOver={(e) =>
                  onHandleMouseOver(e, row?.receiver_account_id)
                }
              >
                {truncateString(row?.receiver_account_id, 17, '...')}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <Menu>
          <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
            {t ? t('to') : 'To'}
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="bg-white dark:bg-black-600 dark:border-black-200 shadow-lg border rounded-b-lg p-2 z-50">
            <form onSubmit={onFilter}>
              <input
                className="border dark:border-black-200  rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                name="to"
                onChange={onChange}
                placeholder={
                  t ? t('filter.placeholder') : 'Search by address e.g. Ⓝ..'
                }
                value={form.to}
              />
              <div className="flex">
                <button
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 h-7 dark:text-black text-white text-xs mr-2"
                  type="submit"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t ? t('filter.filter') : 'Filter'}
                </button>
                <button
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10 text-xs h-7"
                  name="to"
                  onClick={onClear}
                  type="button"
                >
                  {t ? t('filter.clear') : 'Clear'}
                </button>
              </div>
            </form>
          </MenuList>
        </Menu>
      ),
      key: 'receiver_account_id',
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-48',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Link
            className="text-green-500 dark:text-green-250 hover:no-underline"
            href={`/blocks/${row?.included_in_block_hash}`}
          >
            {row?.block?.block_height
              ? localFormat(row?.block?.block_height)
              : row?.block?.block_height ?? ''}
          </Link>
        </span>
      ),
      header: <span>{t ? t('blockHeight') : ' BLOCK HEIGHT'}</span>,
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
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={
              showAge
                ? 'Click to show Datetime Format'
                : 'Click to show Age Format'
            }
          >
            <button
              className="text-left text-xs w-full h-5 flex items-center font-semibold uppercase tracking-wider  text-green-500  dark:text-green-250 focus:outline-none whitespace-nowrap"
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
          <button className="px-2" onClick={onOrder} type="button">
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
              <SortIcon order={router.query.order as string} />
            </div>
          </button>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: 'inline-flex whitespace-nowrap',
    },
  ];

  return (
    <>
      {' '}
      {/* {loading && <Spinner />} */}
      <div className=" bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 pl-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
              {count &&
                txns?.length > 0 &&
                `${
                  t
                    ? t('listing', {
                        count: localFormat
                          ? localFormat(count?.toString())
                          : '',
                      })
                    : `More than > ${count} transactions found`
                }`}
            </p>
          </div>
          {modifiedFilter && Object.keys(modifiedFilter)?.length > 0 && (
            <div className="lg:ml-auto px-6 pb-1">
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
    </>
  );
};

export default List;
