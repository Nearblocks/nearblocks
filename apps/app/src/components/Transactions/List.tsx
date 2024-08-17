import { useState } from 'react';
import { txnMethod } from '../../utils/near';
import Link from 'next/link';
import TxnStatus from '../common/Status';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import FaLongArrowAltRight from '../Icons/FaLongArrowAltRight';
import {
  localFormat,
  truncateString,
  yoctoToNear,
  isAction,
} from '@/utils/libs';
import SortIcon from '../Icons/SortIcon';
import Clock from '../Icons/Clock';
import { TransactionInfo } from '@/utils/types';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import Table from '../common/Table';
import { Tooltip } from '@reach/tooltip';
import useTranslation from 'next-translate/useTranslation';
import Filters from '../common/Filters';
import Filter from '../Icons/Filter';
import { useRouter } from 'next/router';
import TimeStamp from '../common/TimeStamp';

interface ListProps {
  txnsData: {
    txns: TransactionInfo[];
    cursor: string;
  };
  txnsCount: {
    txns: { count: string }[];
  };
  error: boolean;
}

const initialForm = {
  action: '',
  method: '',
  from: '',
  to: '',
};

const List = ({ txnsData, txnsCount, error }: ListProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [showAge, setShowAge] = useState(true);
  const [address, setAddress] = useState('');
  const [form, setForm] = useState(initialForm);
  const [page, setPage] = useState(1);
  const errorMessage = t ? t('txns:noTxns') : ' No transactions found!';

  const count = txnsCount?.txns[0]?.count;
  const txns = txnsData?.txns;
  let cursor = txnsData?.cursor;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'type') {
      if (isAction(value)) {
        setForm((prev) => ({ ...prev, action: value, method: '' }));
      } else {
        setForm((prev) => ({ ...prev, method: value, action: '' }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleShowAge = () => setShowAge((prev) => !prev);

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);

    const { action, method, from, to } = form;
    const { pathname, query } = router;
    const { cursor, p, ...updatedQuery } = query;

    const queryParams = {
      ...(action && { action }),
      ...(method && { method }),
      ...(from && { from }),
      ...(to && { to }),
    };

    const finalQuery = { ...updatedQuery, ...queryParams };

    router.push({ pathname, query: finalQuery });
  };

  const onClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.currentTarget;

    setPage(1);
    const { cursor, p, ...restQuery } = router.query;

    if (name === 'type') {
      setForm((prev) => ({ ...prev, action: '', method: '' }));
      const { action, method, ...newQuery } = restQuery;

      router.push({
        pathname: router.pathname,
        query: newQuery,
      });
      return;
    } else {
      setForm((f) => ({ ...f, [name]: '' }));
      const { [name]: _, ...newQuery } = restQuery;

      router.push({
        pathname: router.pathname,
        query: newQuery,
      });
    }

    setPage(1);
  };

  const onAllClear = () => {
    setForm(initialForm);

    const { cursor, action, method, from, to, block, order, p, ...newQuery } =
      router.query;

    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  const onOrder = () => {
    const { pathname, query } = router;
    const { cursor, p, order, ...updatedQuery } = query;
    const currentOrder = order ?? 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    router.push({
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
    const { cursor, order, p, ...rest } = queryParams;
    return rest;
  }

  const modifiedFilter = removeCursor();

  const columns: any = [
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus status={row?.outcomes?.status} showLabel={false} />
        </>
      ),
      tdClassName:
        'pl-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-12',
    },
    {
      header: <span>{t ? t('txns:hash') : 'TXN HASH'}</span>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            label={row?.transaction_hash}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          >
            <span className="truncate max-w-[120px] inline-block align-bottom whitespace-nowrap text-green-500 dark:text-green-250">
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
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10 w-44',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap  text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: (
        <Menu>
          <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
            {t ? t('txns:type') : 'METHOD'}
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="bg-white dark:bg-black-600 dark:border-black-200 shadow-lg border rounded-b-lg p-2 z-50">
            <form onSubmit={onFilter} className="flex flex-col">
              <input
                name="type"
                value={form.action || form.method}
                onChange={onChange}
                placeholder="Search by method"
                className="border dark:border-black-200  rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
              />
              <div className="flex">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 h-7 text-white dark:text-black text-xs mr-2"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t ? t('txns:filter.filter') : 'Filter'}
                </button>
                <button
                  name="type"
                  type="button"
                  onClick={onClear}
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10 text-xs h-7"
                >
                  {t ? t('txns:filter.clear') : 'Clear'}
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
            label={txnMethod(row?.actions, t)}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">
                {txnMethod(row?.actions, t)}
              </span>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-40',
      thClassName: 'px-1.5',
    },
    {
      header: <span>{t ? t('txns:depositValue') : 'DEPOSIT VALUE'}</span>,
      key: 'deposit',
      cell: (row: TransactionInfo) => (
        <span>
          {row?.actions_agg?.deposit
            ? yoctoToNear(row?.actions_agg?.deposit, true)
            : row?.actions_agg?.deposit ?? ''}{' '}
          Ⓝ
        </span>
      ),
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('txns:txnFee') : 'TXN FEE'}</span>,
      key: 'transaction_fee',
      cell: (row: TransactionInfo) => (
        <span>
          {row?.outcomes_agg?.transaction_fee
            ? yoctoToNear(row?.outcomes_agg?.transaction_fee, true)
            : row?.outcomes_agg?.transaction_fee ?? ''}{' '}
          Ⓝ
        </span>
      ),
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: (
        <Menu>
          <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
            {t ? t('txns:from') : 'FROM'}
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="bg-white dark:bg-black-600 dark:border-black-200 shadow-lg border rounded-b-lg p-2 z-50">
            <form onSubmit={onFilter}>
              <input
                name="from"
                value={form.from}
                onChange={onChange}
                placeholder={
                  t
                    ? t('txns:filter.placeholder')
                    : 'Search by address e.g. Ⓝ..'
                }
                className="border dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600  dark:text-neargray-10 text-xs"
              />
              <div className="flex">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 dark:text-black h-7 text-white text-xs mr-2"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t ? t('txns:filter.filter') : 'Filter'}
                </button>
                <button
                  name="from"
                  type="button"
                  onClick={onClear}
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10 text-xs h-7"
                >
                  {t ? t('txns:filter.clear') : 'Clear'}
                </button>
              </div>
            </form>
          </MenuList>
        </Menu>
      ),
      key: 'signer_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            label={row?.signer_account_id}
            className="absolute h-auto max-w-xs bg-black  bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <span
              className={`truncate max-w-[120px] inline-block align-bottom border rounded-md p-0.5 px-1 text-green-500 dark:text-green-250 whitespace-nowrap ${
                row?.signer_account_id === address
                  ? ' bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                  : 'text-green-500 dark:text-green-250 border-transparent'
              }`}
            >
              <Link
                href={`/address/${row?.signer_account_id}`}
                className="hover:no-underline"
                onMouseOver={(e) =>
                  onHandleMouseOver(e, row?.signer_account_id)
                }
                onMouseLeave={handleMouseLeave}
              >
                {row?.signer_account_id}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-48',
      thClassName: 'px-1',
    },
    {
      header: <span></span>,
      key: '',
      cell: () => (
        <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
          <FaLongArrowAltRight />
        </div>
      ),
    },
    {
      header: (
        <Menu>
          <MenuButton className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
            {t ? t('txns:to') : 'To'}
            <Filter className="h-4 w-4 fill-current ml-2" />
          </MenuButton>
          <MenuList className="bg-white dark:bg-black-600 dark:border-black-200 shadow-lg border rounded-b-lg p-2 z-50">
            <form onSubmit={onFilter}>
              <input
                name="to"
                value={form.to}
                onChange={onChange}
                placeholder={
                  t
                    ? t('txns:filter.placeholder')
                    : 'Search by address e.g. Ⓝ..'
                }
                className="border dark:border-black-200  rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
              />
              <div className="flex">
                <button
                  type="submit"
                  className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 h-7 dark:text-black text-white text-xs mr-2"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t ? t('txns:filter.filter') : 'Filter'}
                </button>
                <button
                  name="to"
                  type="button"
                  onClick={onClear}
                  className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-neargray-10 text-xs h-7"
                >
                  {t ? t('txns:filter.clear') : 'Clear'}
                </button>
              </div>
            </form>
          </MenuList>
        </Menu>
      ),
      key: 'receiver_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            label={row?.receiver_account_id}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <span>
              <Link
                href={`/address/${row?.receiver_account_id}`}
                className={`text-green-500 border rounded-md dark:text-green-250 p-1 hover:no-underline whitespace-nowrap ${
                  row?.receiver_account_id === address
                    ? ' bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                    : 'text-green-500 dark:text-green-250 border-transparent'
                }`}
                onMouseOver={(e) =>
                  onHandleMouseOver(e, row?.receiver_account_id)
                }
                onMouseLeave={handleMouseLeave}
              >
                {truncateString(row?.receiver_account_id, 17, '...')}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-4 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium w-48',
    },
    {
      header: <span>{t ? t('txns:blockHeight') : ' BLOCK HEIGHT'}</span>,
      key: 'block_height',
      cell: (row: TransactionInfo) => (
        <span>
          <Link
            href={`/blocks/${row?.included_in_block_hash}`}
            className="text-green-500 dark:text-green-250 hover:no-underline"
          >
            {row?.block?.block_height
              ? localFormat(row?.block?.block_height)
              : row?.block?.block_height ?? ''}
          </Link>
        </span>
      ),
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
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
              className="text-left text-xs w-full h-5 flex items-center font-semibold uppercase tracking-wider  text-green-500  dark:text-green-250 focus:outline-none whitespace-nowrap"
            >
              {showAge
                ? t
                  ? t('txns:age')
                  : 'AGE'
                : t
                ? t('txns:ageDT')
                : 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
          <button type="button" onClick={onOrder} className="px-2">
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
              <SortIcon order={router.query.order as string} />
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
                    ? t('txns:listing', {
                        count: localFormat ? localFormat(count.toString()) : '',
                      })
                    : `More than > ${count} transactions found`
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
      </div>
    </>
  );
};

export default List;
