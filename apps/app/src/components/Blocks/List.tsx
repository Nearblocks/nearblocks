import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import { BlocksInfo } from '@/utils/types';
import {
  convertToMetricPrefix,
  formatTimestampToString,
  gasFee,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
  shortenAddress,
} from '@/utils/libs';

import Link from 'next/link';
import { Tooltip } from '@reach/tooltip';
import Clock from '../Icons/Clock';
import FaInbox from '../Icons/FaInbox';
import useTranslation from 'next-translate/useTranslation';
import Skeleton from '../skeleton/common/Skeleton';
import Table from '../common/Table';
import TimeStamp from '../common/TimeStamp';

const List = ({
  data,
  totalCount,
  isLoading,
  countLoading,
  apiUrl,
  setUrl,
  error,
}: any) => {
  const { t } = useTranslation();
  const [showAge, setShowAge] = useState(true);
  const [page, setPage] = useState(1);
  const errorMessage = t ? t('blocks:noBlocks') : 'No blocks!';
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
      header: <span>{t ? t('blocks:blocks') : 'BLOCK'}</span>,
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
                  {t ? t('blocks:age') : 'AGE'}
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
          <TimeStamp timestamp={row?.block_timestamp} showAge={showAge} />
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
    },
    {
      header: <span>{t ? t('blocks:txn') : 'TXN'}</span>,
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
      header: <span>{t ? t('blocks:block.receipt') : 'RECEIPT'}</span>,
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
      header: <span className="pl-1">{t ? t('blocks:miner') : 'AUTHOR'}</span>,
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
      header: <span>{t ? t('blocks:block.gasUsed') : 'GAS USED'}</span>,
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
      header: <span>{t ? t('blocks:block.gasLimit') : 'GAS LIMIT'}</span>,
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
      header: <span>{t ? t('blocks:block.gasFee') : 'GAS FEE'}</span>,
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
      {isLoading || countLoading ? (
        <div className="pl-6 max-w-lg w-full py-5 ">
          <Skeleton className="pl-6 max-w-sm leading-7 h-4" />
        </div>
      ) : (
        <div className="leading-7 pl-6 text-sm py-4 text-nearblue-600 dark:text-neargray-10">
          {blocks && Object.keys(blocks).length > 0 && (
            <p className="sm:w-full w-65">
              {t
                ? t('blocks:listing', {
                    from: start?.block_height
                      ? localFormat && localFormat(start?.block_height)
                      : start?.block_height ?? '',
                    to: end?.block_height
                      ? localFormat && localFormat(end?.block_height)
                      : end?.block_height ?? '',
                    count: localFormat && localFormat(count.toString()),
                  })
                : `Block #${
                    start?.block_height
                      ? localFormat && localFormat(start?.block_height)
                      : start?.block_height ?? ''
                  } to ${
                    '#' + end?.block_height
                      ? localFormat && localFormat(end?.block_height)
                      : end?.block_height ?? ''
                  } (Total of ${
                    localFormat && localFormat(count.toString())
                  } blocks)`}{' '}
            </p>
          )}
        </div>
      )}
      <Table
        columns={columns}
        data={blocks}
        isLoading={isLoading}
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
