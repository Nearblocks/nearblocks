'use client';
import { Tooltip } from '@reach/tooltip';
import Big from 'big.js';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import ErrorMessage from '@/components/common/ErrorMessage';
import TxnStatus from '@/components/common/Status';
import TokenImage from '@/components/common/TokenImage';
import Clock from '@/components/Icons/Clock';
import FaInbox from '@/components/Icons/FaInbox';
import FaLongArrowAltRight from '@/components/Icons/FaLongArrowAltRight';
import useRpc from '@/hooks/app/useRpc';
import { Link } from '@/i18n/routing';
import {
  formatTimestampToString,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
} from '@/utils/libs';
import { tokenAmount } from '@/utils/near';
import { TransactionInfo } from '@/utils/types';

import AddressLink from '../common/AddressLink';
import Table from '../common/Table';

interface ListProps {
  data: {
    cursor: string;
    txns: TransactionInfo[];
  };
  error: boolean;
  status: {
    height: string;
    sync: boolean;
  };
  totalCount: {
    txns: { count: string }[];
  };
}

const FTTransfersActions = ({ data, error, status, totalCount }: ListProps) => {
  const t = useTranslations();
  const [showAge, setShowAge] = useState(true);
  const [page, setPage] = useState(1);
  const errorMessage = t ? t('noTxns') : 'No transactions found!';
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
    if (typeof status?.height === 'string' && Number(status?.height) > 0) {
      fetchTimeStamp(status?.height);
    } else {
      console.log('Invalid height:', status?.height);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.height]);

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
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus showLabel={false} status={row?.outcomes?.status} />
        </>
      ),
      header: <span></span>,
      key: '',
      tdClassName:
        'pl-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <Tooltip
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          label={row?.transaction_hash}
        >
          <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap">
            <Link
              className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
              href={`/txns/${row?.transaction_hash}`}
            >
              {row?.transaction_hash}
            </Link>
          </span>
        </Tooltip>
      ),
      header: <span>{t ? t('fts.hash') : 'HASH'}</span>,
      key: 'transaction_hash',
      tdClassName: 'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 whitespace-nowrap text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={row?.cause}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </Tooltip>
        </span>
      ),
      header: <span className="px-1"> {t ? t('type') : 'TYPE'}</span>,
      key: 'actions',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => {
        return Number(row?.delta_amount) < 0 ? (
          <span>
            {row?.affected_account_id ? (
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                label={row?.affected_account_id}
              >
                <span>
                  <AddressLink
                    address={address}
                    className={
                      'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                    }
                    currentAddress={row?.affected_account_id}
                    name={row?.affected_account_id}
                    onMouseLeave={handleMouseLeave}
                    onMouseOver={onHandleMouseOver}
                  />
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
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                label={row?.involved_account_id}
              >
                <span>
                  <AddressLink
                    address={address}
                    className={
                      'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                    }
                    currentAddress={row?.involved_account_id}
                    name={row?.involved_account_id}
                    onMouseLeave={handleMouseLeave}
                    onMouseOver={onHandleMouseOver}
                  />
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
        'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
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
      header: <span></span>,
      key: '',
      tdClassName: 'text-center',
    },
    {
      cell: (row: TransactionInfo) => {
        return Number(row?.delta_amount) < 0 ? (
          <span>
            {row?.involved_account_id ? (
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                label={row?.involved_account_id}
              >
                <span>
                  <AddressLink
                    address={address}
                    className={
                      'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                    }
                    currentAddress={row?.involved_account_id}
                    name={row?.involved_account_id}
                    onMouseLeave={handleMouseLeave}
                    onMouseOver={onHandleMouseOver}
                  />
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
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                label={row?.affected_account_id}
              >
                <span>
                  <AddressLink
                    address={address}
                    className={
                      'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                    }
                    currentAddress={row?.affected_account_id}
                    name={row?.affected_account_id}
                    onMouseLeave={handleMouseLeave}
                    onMouseOver={onHandleMouseOver}
                  />
                </span>
              </Tooltip>
            ) : (
              'system'
            )}
          </span>
        );
      },
      header: <span className="px-1">To</span>,
      key: 'involved_account_id',
      tdClassName:
        'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
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
      header: <span> Quantity</span>,
      key: 'block_height',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => {
        return (
          row?.ft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  alt={row?.ft?.name}
                  className="w-4 h-4"
                  src={row?.ft?.icon}
                />
              </span>
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                label={row?.ft?.name}
              >
                <div className="text-sm text-nearblue-600 dark:text-neargray-10 max-w-[110px] inline-block truncate whitespace-nowrap">
                  <Link
                    className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                    href={`/token/${row?.ft?.contract}`}
                  >
                    {row?.ft?.name}
                  </Link>
                </div>
              </Tooltip>
              {row?.ft?.symbol && (
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  label={row?.ft?.symbol}
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
      header: <span>Token</span>,
      key: 'block_height',
      tdClassName:
        'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={
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
        <div className="w-full inline-flex px-5 py-4">
          <Tooltip
            className="absolute h-auto max-w-[10rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={
              showAge
                ? 'Click to show Datetime Format'
                : 'Click to show Age Format'
            }
          >
            <button
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
              onClick={toggleShowAge}
              type="button"
            >
              {showAge
                ? t
                  ? t('fts.age')
                  : 'AGE'
                : t
                ? t('fts.ageDT')
                : 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: 'inline-flex whitespace-nowrap',
    },
  ];
  return (
    <div className="bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl pb-1">
      {!status?.sync && (
        <div className="w-full text-center bg-nearblue dark:bg-black-200 rounded-t-xl px-5 py-4 text-green dark:text-green-250 text-sm">
          Token transfers are out of sync. Last synced block was
          <span className="font-bold mx-0.5">
            {localFormat && localFormat(status?.height)}
          </span>
          {`(${timestamp && getTimeAgoString(nanoToMilli(timestamp))}).`}
          Token transfers data will be delayed.
        </div>
      )}
      <div className={`flex flex-col lg:flex-row pt-4`}>
        <div className="flex flex-col">
          <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
            {tokens &&
              tokens.length > 0 &&
              `A total of ${localFormat && localFormat(count?.toString())}${' '}
                  transactions found`}
          </p>
        </div>
      </div>
      <Table
        columns={columns}
        cursor={cursor}
        cursorPagination={true}
        data={tokens}
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
  );
};

export default FTTransfersActions;
