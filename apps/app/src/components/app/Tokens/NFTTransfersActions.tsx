'use client';
import { Tooltip } from '@reach/tooltip';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import ErrorMessage from '@/components/common/ErrorMessage';
import TxnStatus from '@/components/common/Status';
import TimeStamp from '@/components/common/TimeStamp';
import TokenImage from '@/components/common/TokenImage';
import Clock from '@/components/Icons/Clock';
import FaInbox from '@/components/Icons/FaInbox';
import FaLongArrowAltRight from '@/components/Icons/FaLongArrowAltRight';
import useRpc from '@/hooks/app/useRpc';
import { Link } from '@/i18n/routing';
import { getTimeAgoString, localFormat, nanoToMilli } from '@/utils/libs';
import { TransactionInfo } from '@/utils/types';

import Table from '../common/Table';

interface ListProps {
  data: {
    cursor: string;
    txns: TransactionInfo[];
  };
  error: boolean;
  status: {
    height: number;
    sync: boolean;
  };
  totalCount: {
    txns: { count: string }[];
  };
}

const NFTTransfersActions = ({
  data,
  error,
  status,
  totalCount,
}: ListProps) => {
  const [showAge, setShowAge] = useState(true);
  const [page, setPage] = useState(1);
  const t = useTranslations();
  const { getBlockDetails } = useRpc();
  const errorMessage = t ? t('noTxns') : 'No transactions found!';
  const [address, setAddress] = useState('');
  const [timestamp, setTimeStamp] = useState('');

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };

  const count = totalCount?.txns[0]?.count;
  const tokens: TransactionInfo[] = data?.txns;
  let cursor = data?.cursor;

  useEffect(() => {
    const fetchTimeStamp = async (height: string) => {
      try {
        const res = await getBlockDetails(Number(height));
        const resp = res?.header;
        if (resp) {
          setTimeStamp(resp?.timestamp_nanosec);
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

  const columns = [
    {
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus showLabel={false} status={row?.outcomes?.status} />
        </>
      ),
      header: <span></span>,
      key: '',
      tdClassName:
        'pl-5 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
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
        </span>
      ),
      header: <span>{'HASH'}</span>,
      key: 'transaction_hash',
      tdClassName: 'px-5 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
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
      header: <span className="pl-2"> {'TYPE'}</span>,
      key: 'cause',
      tdClassName:
        'px-5 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => {
        return Number(row.delta_amount) < 0 ? (
          <span>
            {row?.affected_account_id ? (
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
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
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
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
      header: <span className="pl-1">From</span>,
      key: 'affected_account_id',
      tdClassName:
        'px-5 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => {
        return row.affected_account_id === row.involved_account_id ? (
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
        return Number(row.delta_amount) < 0 ? (
          <span>
            {row?.involved_account_id ? (
              <Tooltip
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
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
                className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
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
        'px-5 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => (
        <div className="whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 max-w-[110px] inline-block truncate">
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
            label={row?.token_id}
          >
            <span>
              <Link
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                href={`/nft-token/${row?.nft?.contract}/${row?.token_id}`}
              >
                {row?.token_id}
              </Link>
            </span>
          </Tooltip>
        </div>
      ),
      header: <span>Token ID</span>,
      key: 'block_height',
      tdClassName: 'px-5 py-2',
      thClassName:
        'px-5 py-4 whitespace-nowrap text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => {
        return (
          row?.nft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  alt={row?.nft?.name}
                  className="w-4 h-4"
                  src={row?.nft?.icon}
                />
              </span>
              <Tooltip
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                label={row?.nft?.name}
              >
                <div className="text-sm text-nearblue-600 dark:text-neargray-10 max-w-[110px] inline-block truncate">
                  <Link
                    className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                    href={`/nft-token/${row?.nft?.contract}`}
                  >
                    {row?.nft?.name}
                  </Link>
                </div>
              </Tooltip>
              {row?.nft?.symbol && (
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  label={row?.nft?.symbol}
                >
                  <div className="text-sm text-nearblue-700 max-w-[80px] inline-block truncate">
                    &nbsp; {row?.nft?.symbol}
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
        'px-5 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 w-56 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <TimeStamp
            showAge={showAge}
            suppressHydrationWarning
            timestamp={row?.block_timestamp}
          />
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
              {showAge ? 'AGE' : 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-5 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
      thClassName: 'inline-flex whitespace-nowrap',
    },
  ];

  return (
    <div className="bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl pb-1">
      <>
        {!status?.sync && (
          <div className="w-full text-center bg-nearblue dark:bg-black-200 rounded-t-xl px-5 py-4 text-green dark:text-green-250 text-sm">
            Non-Fungible token transfers are out of sync. Last synced block was
            <span className="font-bold mx-0.5">
              {status?.height && localFormat(status?.height?.toString())}
            </span>
            {`(${timestamp && getTimeAgoString(nanoToMilli(timestamp))}).`}
            Non-Fungible token transfers data will be delayed.
          </div>
        )}
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
              {tokens &&
                tokens?.length > 0 &&
                count &&
                `A total of ${localFormat(count?.toString())}${' '}
              transactions found`}
            </p>
          </div>
        </div>
      </>
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

export default NFTTransfersActions;
