'use client';

import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';

import { Link } from '@/i18n/routing';
import {
  convertToMetricPrefix,
  formatTimestampToString,
  gasFee,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
} from '@/utils/app/libs';
import { BlocksInfo } from '@/utils/types';

import AddressLink from '../common/AddressLink';
import ErrorMessage from '../common/ErrorMessage';
import Table from '../common/Table';
import Tooltip from '../common/Tooltip';
import Clock from '../Icons/Clock';
import FaInbox from '../Icons/FaInbox';
import Skeleton from '../skeleton/common/Skeleton';

const ListActions = ({
  countLoading,
  data,
  error,
  setUrl,
  totalCount,
}: any) => {
  const [showAge, setShowAge] = useState(true);
  const [page, setPage] = useState(1);
  const t = useTranslations();
  const errorMessage = t('noBlocks') || 'No blocks!';
  const [address, setAddress] = useState('');

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();
    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };
  const blocks = data?.blocks;
  const start = data?.blocks?.[0];
  const end = data?.blocks?.[data?.blocks?.length - 1];
  const count = totalCount?.blocks?.[0]?.count || 0;
  const cursor = data?.cursor;
  const toggleShowAge = () => setShowAge((s) => !s);
  const columns: any = [
    {
      cell: (row: BlocksInfo) => (
        <span>
          <Link
            className="text-green-500 dark:text-green-250 hover:no-underline"
            href={`/blocks/${row?.block_hash}`}
          >
            {row?.block_height
              ? localFormat(row?.block_height)
              : row?.block_height ?? ''}
          </Link>
        </span>
      ),
      header: <span>{t('blocks') || 'BLOCK'}</span>,
      key: 'block_hash',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600  dark:text-neargray-10 font-medium',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: BlocksInfo) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={
              showAge
                ? row?.block_timestamp
                  ? formatTimestampToString(nanoToMilli(row?.block_timestamp))
                  : ''
                : row?.block_timestamp
                ? getTimeAgoString(nanoToMilli(row?.block_timestamp))
                : ''
            }
          >
            <span>
              {!showAge
                ? row?.block_timestamp
                  ? formatTimestampToString(nanoToMilli(row?.block_timestamp))
                  : ''
                : row?.block_timestamp
                ? getTimeAgoString(nanoToMilli(row?.block_timestamp))
                : ''}
            </span>
          </Tooltip>
        </span>
      ),
      header: (
        <div>
          <Tooltip
            className={'whitespace-nowrap max-w-[200px]'}
            tooltip={
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
                  {t('age') || 'AGE'}
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
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
    },
    {
      cell: (row: BlocksInfo) => (
        <span>
          <Link
            className="text-green-500 dark:text-green-250 hover:no-underline font-medium"
            href={`/txns?block=${row?.block_hash}`}
          >
            {row?.transactions_agg?.count
              ? localFormat(row?.transactions_agg?.count)
              : row?.transactions_agg?.count ?? ''}
          </Link>
        </span>
      ),
      header: <span>{'TXN'}</span>,
      key: 'count',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: BlocksInfo) => (
        <span>
          {row?.receipts_agg?.count
            ? localFormat(row?.receipts_agg?.count)
            : row?.receipts_agg?.count ?? ''}
        </span>
      ),
      header: <span>{t('block.receipt') || 'RECEIPT'}</span>,
      key: 'count',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: BlocksInfo) => (
        <span>
          <AddressLink
            address={address}
            currentAddress={row?.author_account_id}
            onMouseLeave={handleMouseLeave}
            onMouseOver={onHandleMouseOver}
          />
        </span>
      ),
      header: <span className="pl-1">{t('miner') || 'AUTHOR'}</span>,
      key: 'author_account_id',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: BlocksInfo) => (
        <span>
          {row?.chunks_agg?.gas_used !== null
            ? convertToMetricPrefix(row?.chunks_agg?.gas_used) + 'gas'
            : ''}
        </span>
      ),
      header: <span>{t('block.gasUsed') || 'GAS USED'}</span>,
      key: 'gas_used',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: BlocksInfo) => (
        <span>{convertToMetricPrefix(row?.chunks_agg?.gas_limit ?? 0)}gas</span>
      ),
      header: <span>{t('block.gasLimit') || 'GAS LIMIT'}</span>,
      key: 'gas_limit',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: BlocksInfo) => (
        <span>
          {row?.chunks_agg?.gas_used
            ? gasFee(row?.chunks_agg?.gas_used, row?.gas_price)
            : row?.chunks_agg?.gas_used ?? ''}{' '}
          Ⓝ
        </span>
      ),
      header: <span>{t('block.gasFee') || 'GAS FEE'}</span>,
      key: 'gas_price',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
  ];
  return (
    <div className="bg-white dark:bg-black-600 drak:border-black-200 border soft-shadow rounded-xl pb-1 ">
      <Suspense
        fallback={
          <div className="pl-6 max-w-lg w-full py-5 ">
            <Skeleton className="pl-6 max-w-sm leading-7 h-4" />
          </div>
        }
      >
        <div className="leading-7 pl-6 text-sm py-4 text-nearblue-600 dark:text-neargray-10">
          <p className="sm:w-full w-65">
            {data && (
              <span>
                {(t &&
                  t('block.listing', {
                    count: localFormat(String(count)),
                    from: start?.block_height
                      ? localFormat(String(start?.block_height))
                      : '',
                    to: end?.block_height
                      ? localFormat(String(end?.block_height))
                      : '',
                  })) ||
                  `Block #${
                    start?.block_height
                      ? localFormat(String(start?.block_height))
                      : ''
                  } to #${
                    end?.block_height
                      ? localFormat(String(end?.block_height))
                      : ''
                  } (Total of ${localFormat(String(count))} blocks)`}
              </span>
            )}
          </p>
        </div>
      </Suspense>
      <Table
        columns={columns}
        count={count}
        countLoading={countLoading}
        cursor={cursor}
        cursorPagination={true}
        data={blocks}
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
        setUrl={setUrl}
      />
    </div>
  );
};

export default ListActions;
