'use client';
import { Suspense, useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import { BlocksInfo } from '@/utils/types';

import Link from 'next/link';
import { Tooltip } from '@reach/tooltip';
import Clock from '../Icons/Clock';
import FaInbox from '../Icons/FaInbox';
import Skeleton from '../skeleton/common/Skeleton';
import Table from '../common/Table';
import {
  convertToMetricPrefix,
  formatTimestampToString,
  gasFee,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
  shortenAddress,
} from '@/app/utils/libs';

// Simulated absence of the translation function
const t = (key: string, p?: any): string | undefined => {
  p = {};
  const simulateAbsence = true; // Set to true to simulate absence of t
  return simulateAbsence ? undefined : key; // Return undefined to simulate absence
};
const List = ({
  data,
  totalCount,
  countLoading,
  apiUrl,
  setUrl,
  error,
}: any) => {
  // const t = useTranslations();
  // const locale = useLocale();
  const [showAge, setShowAge] = useState(true);
  const [page, setPage] = useState(1);
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
  console.log({ count });
  const columns: any = [
    {
      header: <span>{t('blocks') || 'BLOCK'}</span>,
      key: 'block_hash',
      cell: (row: BlocksInfo) => (
        <span>
          <Link
            href={`/blocks/${row?.block_hash}`}
            className="text-green-500 dark:text-green-250 hover:no-underline"
          >
            {row?.block_height
              ? localFormat(row?.block_height)
              : row?.block_height ?? ''}
          </Link>
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600  dark:text-neargray-10 font-medium',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: (
        <div>
          <Tooltip
            label={
              showAge
                ? 'Click to show Datetime Format'
                : 'Click to show Age Format'
            }
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-6 py-2 break-words"
          >
            <button
              type="button"
              onClick={toggleShowAge}
              className="w-full flex items-center px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex-row"
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
      cell: (row: BlocksInfo) => (
        <span>
          <Tooltip
            label={
              showAge
                ? row?.block_timestamp
                  ? formatTimestampToString(nanoToMilli(row?.block_timestamp))
                  : ''
                : row?.block_timestamp
                ? getTimeAgoString(nanoToMilli(row?.block_timestamp))
                : ''
            }
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
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
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
    },
    {
      header: <span>{t('txn') || 'TXN'}</span>,
      key: 'count',
      cell: (row: BlocksInfo) => (
        <span>
          <Link
            href={`/txns?block=${row?.block_hash}`}
            className="text-green-500 dark:text-green-250 hover:no-underline font-medium"
          >
            {row?.transactions_agg?.count
              ? localFormat(row?.transactions_agg?.count)
              : row?.transactions_agg?.count ?? ''}
          </Link>
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t('block.receipt') || 'RECEIPT'}</span>,
      key: 'count',
      cell: (row: BlocksInfo) => (
        <span>
          {row?.receipts_agg?.count
            ? localFormat(row?.receipts_agg?.count)
            : row?.receipts_agg?.count ?? ''}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span className="pl-1">{t ? t('miner') : 'AUTHOR'}</span>,
      key: 'author_account_id',
      cell: (row: BlocksInfo) => (
        <span>
          <Link
            href={`/address/${row?.author_account_id}`}
            className={`text-green-500 dark:text-green-250 hover:no-underline p-1 border rounded-md ${
              row?.author_account_id === address
                ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                : 'text-green-500 dark:text-green-250 border-transparent'
            }`}
            onMouseOver={(e) => onHandleMouseOver(e, row?.author_account_id)}
            onMouseLeave={handleMouseLeave}
          >
            {shortenAddress(row?.author_account_id ?? '')}
          </Link>
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t('block.gasUsed') || 'GAS USED'}</span>,
      key: 'gas_used',
      cell: (row: BlocksInfo) => (
        <span>
          {row?.chunks_agg?.gas_used !== null
            ? convertToMetricPrefix(row?.chunks_agg?.gas_used) + 'gas'
            : ''}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t('block.gasLimit') || 'GAS LIMIT'}</span>,
      key: 'gas_limit',
      cell: (row: BlocksInfo) => (
        <span>{convertToMetricPrefix(row?.chunks_agg?.gas_limit ?? 0)}gas</span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t('block.gasFee') || 'GAS FEE'}</span>,
      key: 'gas_price',
      cell: (row: BlocksInfo) => (
        <span>
          {row?.chunks_agg?.gas_used
            ? gasFee(row?.chunks_agg?.gas_used, row?.gas_price)
            : row?.chunks_agg?.gas_used ?? ''}{' '}
          Ⓝ
        </span>
      ),
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
                  t('listing', {
                    from: start?.block_height
                      ? localFormat(String(start?.block_height))
                      : '',
                    to: end?.block_height
                      ? localFormat(String(end?.block_height))
                      : '',
                    count: localFormat(String(count)),
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
        data={blocks}
        countLoading={countLoading}
        count={count}
        limit={25}
        cursorPagination={true}
        cursor={cursor}
        apiUrl={apiUrl}
        setUrl={setUrl}
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
  );
};
export default List;
