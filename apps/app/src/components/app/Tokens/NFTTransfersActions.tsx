'use client';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import useRpc from '@/hooks/app/useRpc';
import { Link } from '@/i18n/routing';
import { getTimeAgoString, localFormat, nanoToMilli } from '@/utils/libs';
import { TransactionInfo } from '@/utils/types';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import TxnStatus from '@/components/app/common/Status';
import Table from '@/components/app/common/Table';
import Timestamp from '@/components/app/common/Timestamp';
import TokenImage from '@/components/app/common/TokenImage';
import Tooltip from '@/components/app/common/Tooltip';
import Clock from '@/components/app/Icons/Clock';
import FaInbox from '@/components/app/Icons/FaInbox';
import FaLongArrowAltRight from '@/components/app/Icons/FaLongArrowAltRight';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

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
  const [timestamp, setTimeStamp] = useState('');

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
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.transaction_hash}
          >
            <AddressOrTxnsLink
              copy
              txnHash={row?.transaction_hash}
              className={
                'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
              }
            />
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
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.cause}
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
                className={'left-1/2 max-w-[200px]'}
                position="top"
                tooltip={row?.affected_account_id}
              >
                <span>
                  <AddressOrTxnsLink
                    copy
                    className={
                      'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                    }
                    currentAddress={row?.affected_account_id}
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
                className={'left-1/2 max-w-[200px]'}
                position="top"
                tooltip={row?.involved_account_id}
              >
                <span>
                  <AddressOrTxnsLink
                    copy
                    className={
                      'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                    }
                    currentAddress={row?.involved_account_id}
                  />
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
                className={'left-1/2 max-w-[200px]'}
                position="top"
                tooltip={row?.involved_account_id}
              >
                <span>
                  <AddressOrTxnsLink
                    copy
                    className={
                      'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                    }
                    currentAddress={row?.involved_account_id}
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
                className={'left-1/2 max-w-[200px]'}
                position="top"
                tooltip={row?.affected_account_id}
              >
                <span>
                  <AddressOrTxnsLink
                    copy
                    className={
                      'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
                    }
                    currentAddress={row?.affected_account_id}
                  />
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
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.token_id}
          >
            <span>
              <Link
                className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
                href={`/nft-token/${row?.nft?.contract}/${encodeURIComponent(
                  row?.token_id,
                )}`}
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
                className={'left-1/2 max-w-[200px]'}
                position="top"
                tooltip={row?.nft?.name}
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
                  className={'left-1/2 max-w-[200px]'}
                  position="top"
                  tooltip={row?.nft?.symbol}
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
          <Timestamp
            showAge={showAge}
            suppressHydrationWarning
            timestamp={row?.block_timestamp}
          />
        </span>
      ),
      header: (
        <div className="w-full inline-flex px-5 py-4">
          <Tooltip
            className={'whitespace-nowrap max-w-[200px] top-6 -ml-4'}
            tooltip={
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
