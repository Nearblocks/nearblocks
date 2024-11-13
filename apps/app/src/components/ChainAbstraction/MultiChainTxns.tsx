import { Menu, MenuList, MenuButton } from '@reach/menu-button';
import useTranslation from 'next-translate/useTranslation';
import { localFormat } from '@/utils/libs';
import { MultiChainTxnInfo } from '@/utils/types';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import TxnStatus from '../common/Status';
import Link from 'next/link';
import { Tooltip } from '@reach/tooltip';
import Filter from '../Icons/Filter';
import Skeleton from '../skeleton/common/Skeleton';
import Filters from '../common/Filters';
import Clock from '../Icons/Clock';
import SortIcon from '../Icons/SortIcon';
import Table from '../common/Table';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import TimeStamp from '../common/TimeStamp';
import TableSummary from '../common/TableSummary';
import Bitcoin from '../Icons/Bitcoin';
import Ethereum from '../Icons/Ethereum';
import { chain, chainAbstractionExplorerUrl } from '@/utils/config';
import Near from '../Icons/Near';

const initialForm = {
  from: '',
  multichain_address: '',
  chain: '',
};

interface MultiChainTxnsProps {
  txns: MultiChainTxnInfo[];
  count: string;
  error: boolean;
  cursor: string;
  tab: string;
  isTab: boolean;
}

const MultiChainTxns = ({
  txns,
  count,
  error,
  cursor,
  tab,
  isTab,
}: MultiChainTxnsProps) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [showAge, setShowAge] = useState(true);
  const errorMessage = t
    ? t('multi-chain-txns:noTxns')
    : ' No transactions found!';
  const [address, setAddress] = useState('');

  const toggleShowAge = () => setShowAge((s) => !s);

  const onChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;

    return setForm((f) => ({ ...f, [name]: value }));
  };

  const onFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPage(1);

    const { from, multichain_address, chain } = form;
    const { pathname, query } = router;
    const { cursor, p, ...updatedQuery } = query;

    const queryParams = {
      ...(from && { from }),
      ...(multichain_address && { multichain_address }),
      ...(chain && { chain }),
    };

    const finalQuery = { ...updatedQuery, ...queryParams };

    router.push({ pathname, query: finalQuery });
  };

  const onOrder = () => {
    const currentOrder = router.query.order || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        order: newOrder,
      },
    });
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
    const { cursor, p, ...restQuery } = router.query;

    setForm((f) => ({ ...f, [name]: '' }));
    const { [name]: _, ...newQuery } = restQuery;

    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  const onAllClear = () => {
    setForm(initialForm);

    const { cursor, p, from, multichain_address, chain, ...newQuery } =
      router.query;

    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  const handleChainSelect = (chain: string, address: string) => {
    return chain in chainAbstractionExplorerUrl
      ? chainAbstractionExplorerUrl[
          chain as keyof typeof chainAbstractionExplorerUrl
        ]?.address(address)
      : '';
  };

  const columns: any = [
    {
      header: <span></span>,
      key: '',
      cell: (row: MultiChainTxnInfo) => (
        <>
          <TxnStatus status={row?.status} showLabel={false} />
        </>
      ),
      tdClassName:
        'pl-5 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <span>{t ? t('multi-chain-txns:receiptId') : 'RECEIPT ID'}</span>,
      key: 'receipt_id',
      cell: (row: MultiChainTxnInfo) => (
        <span>
          <Tooltip
            label={row?.receipt_id}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          >
            <span className="truncate max-w-[150px] inline-block align-bottom text-green-500  dark:text-green-250 whitespace-nowrap ">
              <Link
                href={`/txns/${row?.transaction_hash}#execution#${row?.receipt_id}`}
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
              >
                {row?.receipt_id}
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
        <span>{t ? t('multi-chain-txns:sourceTxn') : 'SOURCE TXN HASH'}</span>
      ),
      key: 'source_transaction_hash',
      cell: (row: MultiChainTxnInfo) => (
        <span>
          <Tooltip
            label={row?.transaction_hash}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          >
            <span
              className={`inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.2 px-1 border rounded-md ${
                row?.transaction_hash === address
                  ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                  : 'text-green-500 dark:text-green-250 border-transparent'
              }`}
            >
              <Link
                href={`/txns/${row?.transaction_hash}`}
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                onMouseOver={(e) => onHandleMouseOver(e, row?.transaction_hash)}
                onMouseLeave={handleMouseLeave}
              >
                {row?.transaction_hash && (
                  <div className="flex items-center w-full">
                    <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                      <Near className="w-4 h-4 text-black-200 dark:text-neargray-10" />
                    </div>
                    <span className="ml-2 truncate max-w-[150px]">
                      {row?.transaction_hash}
                    </span>
                  </div>
                )}
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
        <>
          <Menu>
            <MenuButton className="flex items-center  text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
              {t ? t('multi-chain-txns:from') : 'FROM'}{' '}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </MenuButton>
            <MenuList className="bg-white shadow-lg border rounded-b-lg p-2">
              <form onSubmit={onFilter} className="flex flex-col">
                <input
                  name="from"
                  value={form.from}
                  onChange={onChange}
                  placeholder={
                    t
                      ? t('multi-chain-txns:filter.placeholder')
                      : 'Search by address e.g. Ⓝ..'
                  }
                  className="border  dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                />
                <div className="flex">
                  <button
                    type="submit"
                    className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                  >
                    <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                    {t ? t('multi-chain-txns:filter.filter') : 'Filter'}
                  </button>
                  <button
                    name="from"
                    type="button"
                    onClick={onClear}
                    className="flex-1 rounded bg-gray-300 text-xs h-7"
                  >
                    {t ? t('multi-chain-txns:filter.clear') : 'Clear'}
                  </button>
                </div>
              </form>
            </MenuList>
          </Menu>
        </>
      ),
      key: 'from',
      cell: (row: MultiChainTxnInfo) => (
        <span>
          <Tooltip
            label={row?.account_id}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          >
            <span
              className={`inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.2 px-1 border rounded-md ${
                row?.account_id === address
                  ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                  : 'text-green-500 dark:text-green-250 border-transparent'
              }`}
            >
              <Link
                href={`/address/${row?.account_id}`}
                className="text-green-500 dark:text-green-250 hover:no-underline"
                onMouseOver={(e) => onHandleMouseOver(e, row?.account_id)}
                onMouseLeave={handleMouseLeave}
              >
                {row?.account_id && (
                  <div className="flex items-center w-full">
                    <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                      <Near className="w-4 h-4 text-black-200 dark:text-neargray-10" />
                    </div>
                    <span className="ml-2 truncate max-w-[150px]">
                      {row?.account_id}
                    </span>
                  </div>
                )}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium ',
      thClassName: 'px-4 py-4',
    },
    {
      header: (
        <span>
          {t ? t('multi-chain-txns:destinationTxn') : 'DESTINATION TXN HASH'}
        </span>
      ),
      key: 'destination_transaction_hash',
      cell: (row: MultiChainTxnInfo) => (
        <span>
          <span
            className={`truncate max-w-[120px] inline-block align-bottom text-green-500 p-0.5 px-1 dark:text-green-250 whitespace-nowrap border rounded-md border-transparent
            `}
          >
            {row?.derived_address && row?.chain && (
              <div className="flex items-center justify-between w-full ">
                <div className="flex items-center">
                  <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                    {row?.chain === chain.bitcoin && (
                      <Bitcoin className="w-4 h-4 text-orange-400" />
                    )}
                    {row?.chain === chain.ethereum && (
                      <Ethereum className="w-4 h-4 text-black-200 dark:text-neargray-10" />
                    )}
                  </div>
                  <span className="ml-2">-</span>
                </div>
              </div>
            )}
          </span>
        </span>
      ),
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: (
        <>
          <Menu>
            <MenuButton className="flex items-center  text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none whitespace-nowrap ">
              {t
                ? t('multi-chain-txns:destinationAddress')
                : 'DESTINATION ADDRESS'}{' '}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </MenuButton>
            <MenuList className="bg-white shadow-lg border rounded-b-lg p-2">
              <form onSubmit={onFilter} className="flex flex-col">
                <input
                  name="multichain_address"
                  value={form.multichain_address}
                  onChange={onChange}
                  placeholder={
                    t
                      ? t('multi-chain-txns:filter.placeholderForeign')
                      : 'Search by address'
                  }
                  className="border  dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                />
                <div className="flex">
                  <button
                    type="submit"
                    className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                  >
                    <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                    {t ? t('multi-chain-txns:filter.filter') : 'Filter'}
                  </button>
                  <button
                    name="multichain_address"
                    type="button"
                    onClick={onClear}
                    className="flex-1 rounded bg-gray-300 text-xs h-7"
                  >
                    {t ? t('multi-chain-txns:filter.clear') : 'Clear'}
                  </button>
                </div>
              </form>
            </MenuList>
          </Menu>
        </>
      ),
      key: 'multichain_address',
      cell: (row: MultiChainTxnInfo) => (
        <span>
          <Tooltip
            label={row?.derived_address}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <div
              className={`inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.2 px-1 border rounded-md ${
                row?.derived_address === address
                  ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                  : 'text-green-500 dark:text-green-250 border-transparent'
              }`}
            >
              <Link
                href={handleChainSelect(
                  row?.chain?.toLowerCase(),
                  row?.derived_address,
                )}
                className="text-green-500 dark:text-green-250 hover:no-underline"
                onMouseOver={(e) => onHandleMouseOver(e, row?.derived_address)}
                onMouseLeave={handleMouseLeave}
                target="_blank"
              >
                {row?.derived_address && row?.chain && (
                  <div className="flex items-center w-full">
                    <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                      {row?.chain === 'BITCOIN' && (
                        <Bitcoin className="w-4 h-4 text-orange-400" />
                      )}
                      {row?.chain === 'ETHEREUM' && (
                        <Ethereum className="w-4 h-4 text-black-200 dark:text-neargray-10" />
                      )}
                    </div>
                    <span className="ml-2 truncate max-w-[150px]">
                      {row?.derived_address}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium ',
      thClassName: 'px-4 py-4',
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
                ? t
                  ? t('multi-chain-txns:age')
                  : 'AGE'
                : t
                ? t('multi-chain-txns:ageDT')
                : 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
          <button type="button" onClick={onOrder} className="px-2">
            <div className="text-nearblue-600 font-semibold">
              <SortIcon order={router.query.order as string} />
            </div>
          </button>
        </div>
      ),
      key: 'block_timestamp',
      cell: (row: MultiChainTxnInfo) => (
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
    const queryParams = router.query;
    const { cursor, order, p, tab, keyword, query, filter, ...rest } =
      queryParams;

    return rest;
  }

  const modifiedFilter = removeCursor();

  return (
    <>
      {!isTab || tab === 'multichaintxns' ? (
        <>
          <div className=" bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
            {isTab &&
              (!count ? (
                <div className="pl-6 max-w-lg w-full py-5 ">
                  <Skeleton className="h-4" />
                </div>
              ) : (
                <TableSummary
                  text={
                    txns &&
                    !error &&
                    `${
                      t
                        ? t('multi-chain-txns:count', {
                            count: count
                              ? localFormat && localFormat(count.toString())
                              : 0,
                          })
                        : `A total of${' '}
              ${count ? localFormat && localFormat(count.toString()) : 0}${' '}
              multichain transactions found`
                    }`
                  }
                  filters={
                    <Filters filters={modifiedFilter} onClear={onAllClear} />
                  }
                />
              ))}
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
                  message={errorMessage || ''}
                  mutedText="Please try again later"
                />
              }
            />
          </div>
        </>
      ) : (
        <div className="w-full h-[500px]"></div>
      )}
    </>
  );
};
export default MultiChainTxns;
