'use client';
import { Tooltip } from '@reach/tooltip';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import ErrorMessage from '@/components/common/ErrorMessage';
import TxnStatus from '@/components/common/Status';
import TimeStamp from '@/components/common/TimeStamp';
import Clock from '@/components/Icons/Clock';
import FaInbox from '@/components/Icons/FaInbox';
import FaLongArrowAltRight from '@/components/Icons/FaLongArrowAltRight';
import Skeleton from '@/components/skeleton/common/Skeleton';
import { Link } from '@/i18n/routing';
import { localFormat } from '@/utils/libs';
import { TransactionInfo } from '@/utils/types';

import Table from '../../common/Table';
interface Props {
  count: any;
  cursor: any;
  error: boolean;
  tab: string;
  txns: any;
}

const NFTTransfers = ({ count, cursor, error, tab, txns }: Props) => {
  const t = useTranslations();
  const errorMessage = t ? t('noTxns') : 'No transactions found!';
  const [showAge, setShowAge] = useState(true);
  const [address, setAddress] = useState('');
  const [page, setPage] = useState(1);

  const toggleShowAge = () => setShowAge((s) => !s);

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
  };

  const handleMouseLeave = () => {
    setAddress('');
  };

  const columns = [
    {
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus showLabel={false} status={row?.outcomes?.status} />
        </>
      ),
      header: <span></span>,
      key: '',
      tdClassName: 'pl-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={row?.transaction_hash}
          >
            <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250  whitespace-nowrap">
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
      header: <span>TXN HASH</span>,
      key: 'transaction_hash',
      tdClassName: 'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 whitespace-nowrap text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={row?.cause}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </Tooltip>
        </span>
      ),
      header: <span>METHOD</span>,
      key: 'cause',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => {
        return Number(row.delta_amount) < 0 ? (
          <span>
            {row?.affected_account_id ? (
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                label={row?.affected_account_id}
              >
                <span
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                    row?.affected_account_id === address
                      ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                      : 'text-green-500 dark:text-green-250 border-transparent'
                  }`}
                >
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                    href={`/address/${row?.affected_account_id}`}
                    onMouseLeave={handleMouseLeave}
                    onMouseOver={(e) =>
                      onHandleMouseOver(e, row?.affected_account_id)
                    }
                  >
                    {row?.affected_account_id}
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
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                label={row?.involved_account_id}
              >
                <span
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                    row?.involved_account_id === address
                      ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                      : 'text-green-500 dark:text-green-250 border-transparent'
                  }`}
                >
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                    href={`/address/${row?.involved_account_id}`}
                    onMouseLeave={handleMouseLeave}
                    onMouseOver={(e) =>
                      onHandleMouseOver(e, row?.involved_account_id)
                    }
                  >
                    {row?.involved_account_id}
                  </Link>
                </span>
              </Tooltip>
            ) : (
              'system'
            )}
          </span>
        );
      },
      header: <span>From</span>,
      key: 'affected_account_id',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => {
        return row.affected_account_id === row.involved_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
            SELF
          </span>
        ) : (
          <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
            <FaLongArrowAltRight />
          </div>
        );
      },
      header: <span></span>,
      key: '',
      tdClassName: 'text-center',
    },
    {
      cell: (row: TransactionInfo) => {
        return Number(row.delta_amount) < 0 ? (
          <span>
            {row?.involved_account_id ? (
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                label={row?.involved_account_id}
              >
                <span
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                    row?.involved_account_id === address
                      ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                      : 'text-green-500 dark:text-green-250 border-transparent'
                  }`}
                >
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                    href={`/address/${row?.involved_account_id}`}
                    onMouseLeave={handleMouseLeave}
                    onMouseOver={(e) =>
                      onHandleMouseOver(e, row?.involved_account_id)
                    }
                  >
                    {row?.involved_account_id}
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
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                label={row?.affected_account_id}
              >
                <span
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                    row?.affected_account_id === address
                      ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                      : 'text-green-500 dark:text-green-250 border-transparent'
                  }`}
                >
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                    href={`/address/${row?.affected_account_id}`}
                    onMouseLeave={handleMouseLeave}
                    onMouseOver={(e) =>
                      onHandleMouseOver(e, row?.affected_account_id)
                    }
                  >
                    {row?.affected_account_id}
                  </Link>
                </span>
              </Tooltip>
            ) : (
              'system'
            )}
          </span>
        );
      },
      header: <span>To</span>,
      key: 'involved_account_id',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => (
        <>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={row?.token_id}
          >
            <div className="max-w-[110px] inline-block truncate">
              {row?.token_id}
            </div>
          </Tooltip>
        </>
      ),
      header: <span>TOKEN ID</span>,
      key: 'token_id',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <TimeStamp showAge={showAge} timestamp={row?.block_timestamp} />
        </span>
      ),
      header: (
        <>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={
              showAge
                ? 'Click to show Datetime Format'
                : 'Click to show Age Format'
            }
          >
            <button
              className="text-left text-xs px-5 py-4 w-full flex items-center font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex-row whitespace-nowrap"
              onClick={toggleShowAge}
              type="button"
            >
              {showAge ? (
                <>
                  {'AGE'}
                  <Clock className="text-green-500 dark:text-green-250 ml-2" />
                </>
              ) : (
                <> {'DATE TIME (UTC)'}</>
              )}
            </button>
          </Tooltip>
        </>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: 'inline-flex',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Link
            className="bg-gray-100 dark:bg-black-200 hover:bg-gray-200 px-2 py-1 rounded hover:no-underline"
            href={`/nft-token/${row?.nft?.contract}/${row?.token_id}`}
          >
            View NFT &gt;
          </Link>
        </span>
      ),
      header: <span> DETAILS</span>,
      key: 'contract',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
  ];
  return (
    <>
      {tab === 'transfers' ? (
        <>
          {!count ? (
            <div className="pl-6 max-w-lg w-full py-5 ">
              <Skeleton className="h-4" />
            </div>
          ) : (
            <div className={`flex flex-col lg:flex-row pt-4`}>
              <div className="flex flex-col">
                <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
                  {txns &&
                    !error &&
                    `A total of ${
                      count ? localFormat && localFormat(count.toString()) : 0
                    } transactions found`}
                </p>
              </div>
            </div>
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
            page={page}
            setPage={setPage}
          />
        </>
      ) : (
        <div className="w-full h-[500px]"></div>
      )}
    </>
  );
};

export default NFTTransfers;
