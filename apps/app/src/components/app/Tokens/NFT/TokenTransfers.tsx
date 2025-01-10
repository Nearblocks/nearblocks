import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Link } from '@/i18n/routing';
import {
  formatTimestampToString,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
  truncateString,
} from '@/utils/libs';
import { TransactionInfo } from '@/utils/types';

import AddressLink from '../../common/AddressLink';
import ErrorMessage from '../../common/ErrorMessage';
import TxnStatus from '../../common/Status';
import Table from '../../common/Table';
import Tooltip from '../../common/Tooltip';
import Clock from '../../Icons/Clock';
import FaInbox from '../../Icons/FaInbox';
import FaLongArrowAltRight from '../../Icons/FaLongArrowAltRight';
import Skeleton from '../../skeleton/common/Skeleton';

interface Props {
  data: {
    cursor: string;
    txns: TransactionInfo[];
  };
  error: boolean;
  txnsCount: {
    txns: { count: string }[];
  };
}

export default function TokenTransfers({ data, error, txnsCount }: Props) {
  const [showAge, setShowAge] = useState(true);
  const errorMessage = ' No token transfers found!';
  const [address, setAddress] = useState('');
  const [page, setPage] = useState(1);
  const count = txnsCount?.txns[0]?.count;
  const txns: TransactionInfo[] = data?.txns;
  let cursor = data?.cursor;
  const t = useTranslations();

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
        <span>
          <TxnStatus showLabel={false} status={row?.outcomes?.status} />
        </span>
      ),
      header: '',
      key: 'status',
      tdClassName:
        'pl-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.transaction_hash}
          >
            <span className="truncate max-w-[120px] whitespace-nowrap inline-block align-bottom text-green-500 dark:text-green-250">
              <Link
                className="text-green-500 dark:text-green-250 font-semibold hover:no-underline"
                href={`/txns/${row?.transaction_hash}`}
              >
                {row?.transaction_hash}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: <span>Txn Hash</span>,
      key: 'hash',
      tdClassName: 'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10',
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
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl max-w-[120px] px-2 py-1 inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </Tooltip>
        </span>
      ),
      header: <span>{t('type') || 'METHOD'}</span>,
      key: 'type',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
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
                  <AddressLink
                    address={address}
                    className={'inline-block align-bottom whitespace-nowrap'}
                    currentAddress={row?.affected_account_id}
                    name={truncateString(row?.affected_account_id, 15, '...')}
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
                className={'left-1/2 max-w-[200px]'}
                position="top"
                tooltip={row?.involved_account_id}
              >
                <span>
                  <AddressLink
                    address={address}
                    className={'inline-block align-bottom whitespace-nowrap'}
                    currentAddress={row?.involved_account_id}
                    name={truncateString(row?.involved_account_id, 15, '...')}
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
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
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
                  <AddressLink
                    address={address}
                    className={'inline-block align-bottom whitespace-nowrap'}
                    currentAddress={row?.involved_account_id}
                    name={truncateString(row?.involved_account_id, 15, '...')}
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
                className={'left-1/2 max-w-[200px]'}
                position="top"
                tooltip={row?.affected_account_id}
              >
                <span>
                  <AddressLink
                    address={address}
                    className={'inline-block align-bottom whitespace-nowrap'}
                    currentAddress={row?.affected_account_id}
                    name={truncateString(row?.affected_account_id, 15, '...')}
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
      header: <span>To</span>,
      key: 'involved_account_id',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Link
            className="text-green-500 dark:text-green-250 hover:no-underline font-semibold"
            href={`/blocks/${row?.included_in_block_hash}`}
          >
            {row?.block?.block_height
              ? localFormat(row?.block?.block_height)
              : row?.block?.block_height ?? ''}
          </Link>
        </span>
      ),
      header: <span>BLOCK</span>,
      key: 'block_hash',
      tdClassName:
        'px-6 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider h-[57px]',
    },
    {
      cell: (row: TransactionInfo) => (
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
            position="bottom"
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
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
    },
  ];
  return (
    <>
      {!count ? (
        <div className="pl-3 max-w-sm py-5 h-[60px]">
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
                }${' '}
                transactions found`}
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
  );
}
