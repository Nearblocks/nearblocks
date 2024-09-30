import { TransactionInfo } from '@/utils/types';
import { localFormat, nanoToMilli } from '@/utils/libs';
import { tokenAmount } from '@/utils/near';
import { useEffect, useState } from 'react';
import { Tooltip } from '@reach/tooltip';
import Link from 'next/link';
import Big from 'big.js';
import TxnStatus from '@/components/common/Status';
import FaLongArrowAltRight from '@/components/Icons/FaLongArrowAltRight';
import Clock from '@/components/Icons/Clock';
import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';
import useTranslation from 'next-translate/useTranslation';
import Table from '@/components/common/Table';
import TokenImage from '@/components/common/TokenImage';
import useRpc from '@/hooks/useRpc';
import TimeStamp from '../common/TimeStamp';
import dayjs from '../../utils/dayjs';

interface ListProps {
  data: {
    txns: TransactionInfo[];
    cursor: string;
  };
  totalCount: {
    txns: { count: string }[];
  };
  error: boolean;
  status: {
    height: string;
    sync: boolean;
  };
}

const Transfers = ({ data, totalCount, error, status }: ListProps) => {
  const { t } = useTranslation();
  const [showAge, setShowAge] = useState(true);
  const [page, setPage] = useState(1);
  const errorMessage = t ? t('txns:noTxns') : 'No transactions found!';
  const [address, setAddress] = useState('');
  const { getBlockDetails } = useRpc();
  const [timestamp, setTimeStamp] = useState('');
  const tokens = data?.txns;
  const cursor = data?.cursor;
  const count = totalCount?.txns?.[0]?.count || 0;

  useEffect(() => {
    const fetchTimeStamp = async (height: string) => {
      try {
        const res = await getBlockDetails(Number(height));
        const resp = res?.header;
        if (resp) {
          setTimeStamp(resp.timestamp_nanosec);
        }
      } catch (error) {
        console.error('Error loading schema:', error);
      }
    };
    if (typeof status.height === 'string' && Number(status.height) > 0) {
      fetchTimeStamp(status.height);
    } else {
      console.log('Invalid height:', status.height);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.height]);

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
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus status={row?.outcomes?.status} showLabel={false} />
        </>
      ),
      tdClassName:
        'pl-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <span>{t ? t('token:fts.hash') : 'HASH'}</span>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <Tooltip
          label={row?.transaction_hash}
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
        >
          <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap">
            <Link
              href={`/txns/${row?.transaction_hash}`}
              className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
            >
              {row?.transaction_hash}
            </Link>
          </span>
        </Tooltip>
      ),
      tdClassName: 'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 whitespace-nowrap text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span className="px-1"> {t ? t('type') : 'TYPE'}</span>,
      key: 'actions',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            label={row?.cause}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
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
                label={row?.affected_account_id}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
              >
                <span
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
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
                label={row?.involved_account_id}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
              >
                <span
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
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
      tdClassName:
        'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => {
        return row?.involved_account_id === row?.affected_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
            {t('txns:txnSelf')}
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
      header: <span className="px-1">To</span>,
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
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
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
                label={row?.affected_account_id}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
              >
                <span
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
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
      tdClassName:
        'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span> Quantity</span>,
      key: 'block_height',
      cell: (row: TransactionInfo) => (
        <span>
          {row?.delta_amount
            ? localFormat(
                tokenAmount(
                  Big(row.delta_amount).abs().toString(),
                  row?.ft?.decimals,
                  true,
                ),
              )
            : ''}
        </span>
      ),
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>Token</span>,
      key: 'block_height',
      cell: (row: TransactionInfo) => {
        return (
          row?.ft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  src={row?.ft?.icon}
                  alt={row?.ft?.name}
                  className="w-4 h-4"
                />
              </span>
              <Tooltip
                label={row?.ft?.name}
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
              >
                <div className="text-sm text-nearblue-600 dark:text-neargray-10 max-w-[110px] inline-block truncate whitespace-nowrap">
                  <Link
                    href={`/token/${row?.ft?.contract}`}
                    className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                  >
                    {row?.ft?.name}
                  </Link>
                </div>
              </Tooltip>
              {row?.ft?.symbol && (
                <Tooltip
                  label={row?.ft?.symbol}
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                >
                  <div className="text-sm text-gray-400 max-w-[80px] inline-block truncate whitespace-nowrap">
                    &nbsp; {row?.ft?.symbol}
                  </div>
                </Tooltip>
              )}
            </div>
          )
        );
      },
      tdClassName:
        'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: (
        <div className="w-full inline-flex px-5 py-4">
          <Tooltip
            label={
              showAge
                ? 'Click to show Datetime Format'
                : 'Click to show Age Format'
            }
            className="absolute h-auto max-w-[10rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <button
              type="button"
              onClick={toggleShowAge}
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
            >
              {showAge
                ? t
                  ? t('token:fts.age')
                  : 'AGE'
                : t
                ? t('token:fts.ageDT')
                : 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
        </div>
      ),
      key: 'block_timestamp',
      cell: (row: TransactionInfo) => (
        <span>
          <TimeStamp timestamp={row?.block_timestamp} showAge={showAge} />
        </span>
      ),
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: 'inline-flex whitespace-nowrap',
    },
  ];
  return (
    <>
      <div className="bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl pb-1">
        {!status.sync && (
          <div className="w-full text-center bg-nearblue dark:bg-black-200 rounded-t-xl px-5 py-4 text-green dark:text-green-250 text-sm">
            Token transfers are out of sync. Last synced block was
            <span className="font-bold mx-0.5">
              {localFormat && localFormat(status.height)}
            </span>
            {`(${timestamp && dayjs().to(dayjs(nanoToMilli(timestamp)))}).`}
            Token transfers data will be delayed.
          </div>
        )}
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
              {tokens &&
                tokens.length > 0 &&
                `A total of ${
                  localFormat && localFormat(count.toString())
                }${' '}
                  transactions found`}
            </p>
          </div>
        </div>
        <Table
          columns={columns}
          data={tokens}
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
export default Transfers;
