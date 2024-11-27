'use client';
import { Menu, MenuButton, MenuList } from '@reach/menu-button';
import { Tooltip } from '@reach/tooltip';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import React, { useState } from 'react';

import { Link } from '@/i18n/routing';
import { chain, chainAbstractionExplorerUrl } from '@/utils/app/config';
import { localFormat } from '@/utils/app/libs';
import { MultiChainTxnInfo } from '@/utils/types';

import AddressLink from '../common/AddressLink';
import ErrorMessage from '../common/ErrorMessage';
import Filters from '../common/Filters';
import TxnStatus from '../common/Status';
import Table from '../common/Table';
import TableSummary from '../common/TableSummary';
import TimeStamp from '../common/TimeStamp';
import Bitcoin from '../Icons/Bitcoin';
import Clock from '../Icons/Clock';
import Ethereum from '../Icons/Ethereum';
import FaInbox from '../Icons/FaInbox';
import Filter from '../Icons/Filter';
import Near from '../Icons/Near';
import SortIcon from '../Icons/SortIcon';

const initialForm = {
  chain: '',
  from: '',
  multichain_address: '',
};

interface MultiChainTxnsProps {
  count: string;
  cursor: string;
  error: boolean;
  isTab: boolean;
  tab: string;
  txns: MultiChainTxnInfo[];
}

const MultiChainTxns = ({
  count,
  cursor,
  error,
  isTab,
  tab,
  txns,
}: MultiChainTxnsProps) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [showAge, setShowAge] = useState(true);
  const errorMessage = t ? t('noTxns') : ' No transactions found!';
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

    const { chain, from, multichain_address } = form;
    const { cursor, p, ...updatedQuery } = QueryString.parse(
      searchParams?.toString() || '',
    );

    const queryParams = {
      ...(from && { from }),
      ...(multichain_address && { multichain_address }),
      ...(chain && { chain }),
    };

    const finalQuery = QueryString.stringify({
      ...updatedQuery,
      ...queryParams,
    });

    router.push(`${pathname}?${finalQuery}`);
  };

  const currentParams = QueryString.parse(searchParams?.toString() || '');

  const onOrder = () => {
    const currentOrder = searchParams?.get('order') || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    const newParams = { ...currentParams, order: newOrder };
    const newQueryString = QueryString.stringify(newParams);

    router.push(`${pathname}?${newQueryString}`);
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
    const { cursor, p, ...restQuery } = QueryString.parse(
      searchParams?.toString() || '',
    );

    setForm((f) => ({ ...f, [name]: '' }));
    const { [name]: _, ...newQuery } = restQuery;
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
  };

  const onAllClear = () => {
    setForm(initialForm);
    const { chain, cursor, from, multichain_address, p, ...newQuery } =
      QueryString.parse(searchParams?.toString() || '');
    const newQueryString = QueryString.stringify(newQuery);
    router.push(`${pathname}?${newQueryString}`);
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
      cell: (row: MultiChainTxnInfo) => (
        <>
          <TxnStatus showLabel={false} status={row?.status} />
        </>
      ),
      header: <span></span>,
      key: '',
      tdClassName:
        'pl-5 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: MultiChainTxnInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={row?.receipt_id}
          >
            <span className="truncate max-w-[150px] inline-block align-bottom text-green-500  dark:text-green-250 whitespace-nowrap ">
              <Link
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                href={`/txns/${row?.transaction_hash}?tab=execution#${row?.receipt_id}`}
              >
                {row?.receipt_id}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: <span>{t ? t('receiptId') : 'RECEIPT ID'}</span>,
      key: 'receipt_id',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: MultiChainTxnInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={row?.transaction_hash}
          >
            <span>
              <AddressLink
                address={address}
                className={
                  'inline-block align-bottom whitespace-nowrap font-medium'
                }
                currentAddress={row?.transaction_hash}
                name={
                  row?.transaction_hash && (
                    <div className="flex items-center w-full">
                      <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                        <Near className="w-4 h-4 text-black-200 dark:text-neargray-10" />
                      </div>
                      <span className="ml-2 truncate max-w-[150px]">
                        {row?.transaction_hash}
                      </span>
                    </div>
                  )
                }
                onMouseLeave={handleMouseLeave}
                onMouseOver={onHandleMouseOver}
              />
            </span>
          </Tooltip>
        </span>
      ),
      header: <span>{t ? t('sourceTxn') : 'SOURCE TXN HASH'}</span>,
      key: 'source_transaction_hash',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: MultiChainTxnInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={row?.account_id}
          >
            <span>
              <AddressLink
                address={address}
                className={'inline-block align-bottom whitespace-nowrap'}
                currentAddress={row?.account_id}
                name={
                  row?.account_id && (
                    <div className="flex items-center w-full">
                      <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                        <Near className="w-4 h-4 text-black-200 dark:text-neargray-10" />
                      </div>
                      <span className="ml-2 truncate max-w-[150px]">
                        {row?.account_id}
                      </span>
                    </div>
                  )
                }
                onMouseLeave={handleMouseLeave}
                onMouseOver={onHandleMouseOver}
              />
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <>
          <Menu>
            <MenuButton className="flex items-center  text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none">
              {t ? t('from') : 'FROM'}{' '}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </MenuButton>
            <MenuList className="bg-white shadow-lg border rounded-b-lg p-2">
              <form className="flex flex-col" onSubmit={onFilter}>
                <input
                  className="border  dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                  name="from"
                  onChange={onChange}
                  placeholder={
                    t ? t('filter.placeholder') : 'Search by address e.g. Ⓝ..'
                  }
                  value={form.from}
                />
                <div className="flex">
                  <button
                    className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                    type="submit"
                  >
                    <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                    {t ? t('filter.filter') : 'Filter'}
                  </button>
                  <button
                    className="flex-1 rounded bg-gray-300 text-xs h-7"
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
        </>
      ),
      key: 'from',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium ',
      thClassName: 'px-4 py-4',
    },
    {
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
      header: <span>{t ? t('destinationTxn') : 'DESTINATION TXN HASH'}</span>,
      key: 'destination_transaction_hash',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: MultiChainTxnInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={row?.derived_address}
          >
            <span>
              <AddressLink
                address={address}
                className={'inline-block align-bottom whitespace-nowrap'}
                currentAddress={row?.derived_address}
                href={handleChainSelect(
                  row?.chain?.toLowerCase(),
                  row?.derived_address,
                )}
                name={
                  row?.derived_address &&
                  row?.chain && (
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
                  )
                }
                onMouseLeave={handleMouseLeave}
                onMouseOver={onHandleMouseOver}
                target="_blank"
              />
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <>
          <Menu>
            <MenuButton className="flex items-center  text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none whitespace-nowrap ">
              {t ? t('destinationAddress') : 'DESTINATION ADDRESS'}{' '}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </MenuButton>
            <MenuList className="bg-white shadow-lg border rounded-b-lg p-2">
              <form className="flex flex-col" onSubmit={onFilter}>
                <input
                  className="border  dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                  name="multichain_address"
                  onChange={onChange}
                  placeholder={
                    t ? t('filter.placeholderForeign') : 'Search by address'
                  }
                  value={form.multichain_address}
                />
                <div className="flex">
                  <button
                    className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                    type="submit"
                  >
                    <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                    {t ? t('filter.filter') : 'Filter'}
                  </button>
                  <button
                    className="flex-1 rounded bg-gray-300 text-xs h-7"
                    name="multichain_address"
                    onClick={onClear}
                    type="button"
                  >
                    {t ? t('filter.clear') : 'Clear'}
                  </button>
                </div>
              </form>
            </MenuList>
          </Menu>
        </>
      ),
      key: 'multichain_address',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium ',
      thClassName: 'px-4 py-4',
    },
    {
      cell: (row: MultiChainTxnInfo) => (
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
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
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
            <div className="text-nearblue-600 font-semibold">
              <SortIcon order={currentParams.order as string} />
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

  function removeCursor() {
    const queryParams = QueryString.parse(searchParams?.toString() || '');
    const { cursor, filter, keyword, order, p, query, tab, ...rest } =
      queryParams;

    return rest;
  }

  const modifiedFilter = removeCursor();

  return (
    <>
      {!isTab || tab === 'multichaintxns' ? (
        <>
          <div className=" bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
            {isTab && (
              <TableSummary
                filters={
                  <Filters filters={modifiedFilter} onClear={onAllClear} />
                }
                text={
                  txns &&
                  !error &&
                  `${`A total of${' '}
            ${count ? localFormat && localFormat(count.toString()) : 0}${' '}
            multichain transactions found`}`
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
                  message={errorMessage || ''}
                  mutedText="Please try again later"
                />
              }
              limit={25}
              page={page}
              setPage={setPage}
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
