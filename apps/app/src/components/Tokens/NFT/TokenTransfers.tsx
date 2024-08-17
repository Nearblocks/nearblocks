import {
  formatTimestampToString,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
  truncateString,
} from '@/utils/libs';
import { TransactionInfo } from '@/utils/types';
import { useState } from 'react';
import Link from 'next/link';
import { Tooltip } from '@reach/tooltip';
import useTranslation from 'next-translate/useTranslation';
import TxnStatus from '@/components/common/Status';
import FaLongArrowAltRight from '@/components/Icons/FaLongArrowAltRight';
import Clock from '@/components/Icons/Clock';
import Table from '@/components/common/Table';
import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';

interface Props {
  data: {
    txns: TransactionInfo[];
    cursor: string;
  };
  txnsCount: {
    txns: { count: string }[];
  };
  error: boolean;
}

export default function TokenTransfers({ data, txnsCount, error }: Props) {
  const [showAge, setShowAge] = useState(true);
  const errorMessage = ' No token transfers found!';
  const [address, setAddress] = useState('');
  const [page, setPage] = useState(1);
  const count = txnsCount?.txns[0]?.count;
  const txns: TransactionInfo[] = data?.txns;
  let cursor = data?.cursor;
  const { t } = useTranslation();

  const toggleShowAge = () => setShowAge((s) => !s);
  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();
    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };
  const columns: any = [
    {
      header: '',
      key: 'status',
      cell: (row: TransactionInfo) => (
        <span>
          <TxnStatus status={row?.outcomes?.status} showLabel={false} />
        </span>
      ),
      tdClassName:
        'pl-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <span>Txn Hash</span>,
      key: 'hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={row?.transaction_hash}
          >
            <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250">
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
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>{t ? t('method') : 'METHOD'}</span>,
      key: 'type',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={row?.cause}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl max-w-[120px] inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>From</span>,
      key: 'affected_account_id',
      cell: (row: TransactionInfo) => {
        return Number(row.delta_amount) < 0 ? (
          <span>
            {row?.affected_account_id ? (
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                label={row?.affected_account_id}
              >
                <span
                  className={`inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap border rounded-md ${
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
          </span>
        ) : (
          <span>
            {row?.involved_account_id ? (
              <Tooltip
                label={row?.involved_account_id}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
              >
                <span
                  className={`inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap border rounded-md  ${
                    row?.involved_account_id === address
                      ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                      : 'text-green-500 dark:text-green-250 border-transparent'
                  }`}
                >
                  <Link
                    href={`/address/${row?.involved_account_id}`}
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                    onMouseOver={(e) =>
                      onHandleMouseOver(e, row?.involved_account_id)
                    }
                    onMouseLeave={handleMouseLeave}
                  >
                    {truncateString(row?.involved_account_id, 15, '...')}
                  </Link>
                </span>
              </Tooltip>
            ) : (
              'system'
            )}
          </span>
        );
      },
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => {
        return row.affected_account_id === row.involved_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
            {t('txnSelf')}
          </span>
        ) : (
          <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
            <FaLongArrowAltRight />
          </div>
        );
      },
      tdClassName: 'text-center',
    },
    {
      header: <span>To</span>,
      key: 'involved_account_id',
      cell: (row: TransactionInfo) => {
        return Number(row.delta_amount) < 0 ? (
          <span>
            {row?.involved_account_id ? (
              <Tooltip
                label={row?.involved_account_id}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
              >
                <span
                  className={`inline-block align-bottom text-green-500 dark:text-green-250 p-0.5 px-1 border rounded-md whitespace-nowrap ${
                    row?.involved_account_id === address
                      ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                      : 'text-green-500 dark:text-green-250 border-transparent'
                  }`}
                >
                  {' '}
                  <Link
                    href={`/address/${row?.involved_account_id}`}
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                    onMouseOver={(e) =>
                      onHandleMouseOver(e, row?.involved_account_id)
                    }
                    onMouseLeave={handleMouseLeave}
                  >
                    {truncateString(row?.involved_account_id, 15, '...')}
                  </Link>
                </span>
              </Tooltip>
            ) : (
              'system'
            )}
          </span>
        ) : (
          <span>
            {row?.affected_account_id ? (
              <Tooltip
                label={row?.affected_account_id}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
              >
                <span
                  className={`inline-block align-bottom text-green-500 dark:text-green-250 border rounded-md p-0.5 px-1 whitespace-nowrap ${
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
          </span>
        );
      },
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>BLOCK</span>,
      key: 'block_hash',
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
        'px-6 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider h-[57px]',
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
            className="absolute h-auto max-w-[8rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <button
              type="button"
              onClick={toggleShowAge}
              className="w-full flex items-center px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex-row"
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
      cell: (row: TransactionInfo) => (
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
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
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
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
    },
  ];
  return (
    <>
      <div className={`flex flex-col lg:flex-row pt-4`}>
        <div className="flex flex-col">
          <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
            {txns &&
              count &&
              txns.length > 0 &&
              `A total of ${localFormat && localFormat(count.toString())}${' '}
                transactions found`}
          </p>
        </div>
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
    </>
  );
}
