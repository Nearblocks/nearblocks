'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { localFormat } from '@/utils/libs';
import { TransactionEvent } from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import Table from '../common/Table';
import TableSummary from '../common/TableSummary';
import Tooltip from '../common/Tooltip';
import FaInbox from '../Icons/FaInbox';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import { Link } from '@/i18n/routing';
import { CopyButton } from '../common/CopyButton';
import { formatWithCommas, yoctoToNear } from '@/utils/app/libs';
import Clock from '../Icons/Clock';
import TimeStamp from '../common/TimeStamp';

interface BalanceChange {
  count: string;
  cursor: string;
  error: boolean;
  activities: TransactionEvent[];
}
const BalanceChangeActions = ({
  count,
  cursor,
  error,
  activities,
}: BalanceChange) => {
  const [page, setPage] = useState(1);
  const [showAge, setShowAge] = useState(true);
  const toggleShowAge = () => setShowAge((s) => !s);
  const t = useTranslations();
  const errorMessage = t('noTxns') || ' No transactions found!';

  const columns = [
    {
      cell: (row: TransactionEvent) =>
        row?.receipt_id && (
          <span className="whitespace-nowrap flex">
            <Tooltip
              className={'left-28 max-w-[200px] whitespace-normal'}
              position="top"
              tooltip={row?.receipt_id}
            >
              <span className="truncate max-w-[140px] inline-block align-bottom text-nearblue-600 dark:text-neargray-10">
                {row?.receipt_id}
              </span>
            </Tooltip>
            <CopyButton textToCopy={row?.receipt_id} />
          </span>
        ),
      header: <>{'receipt id'}</>,
      key: 'receipt_id',
      tdClassName: 'px-5 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider',
    },
    {
      cell: (row: TransactionEvent) =>
        row?.transaction_hash && (
          <span className="whitespace-nowrap flex">
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row.transaction_hash}
            >
              <AddressOrTxnsLink
                copy
                className={
                  'truncate max-w-[140px] inline-block align-bottom whitespace-nowrap'
                }
                txnHash={row.transaction_hash}
              />
            </Tooltip>
          </span>
        ),
      header: <>{'tranaction hash'}</>,
      key: 'transaction_hash',
      tdClassName: 'px-5 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionEvent) => (
        <span>
          <Tooltip
            className="left-1/2 max-w-[200px]"
            position="top"
            tooltip={row?.cause}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 inline-flex">
              <span className="block">{row?.cause}</span>
            </span>
          </Tooltip>
        </span>
      ),
      header: t('type') || 'METHOD',
      key: 'cause',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionEvent) => (
        <>
          {row.involved_account_id ? (
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row.involved_account_id}
            >
              <span>
                <AddressOrTxnsLink
                  copy
                  className={'inline-block align-bottom whitespace-nowrap'}
                  currentAddress={row?.involved_account_id}
                />
              </span>
            </Tooltip>
          ) : (
            <span className="p-0.5 px-1.5">system</span>
          )}
        </>
      ),
      header: 'Involved',
      key: 'involved_account_id',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600  font-medium dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionEvent) => (
        <>
          {row.involved_account_id === row.affected_account_id ? (
            <span className="uppercase rounded w-10 py-2 h-6 flex items-center justify-center bg-green-200 dark:bg-nearblue-650/[0.15] dark:text-neargray-650 dark:border dark:border-nearblue-650/[0.25] text-white text-xs font-semibold">
              {t('txnSelf') || 'SELF'}
            </span>
          ) : row?.direction === 'OUTBOUND' ? (
            <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60 text-yellow-700 text-xs font-semibold">
              {t('txnOut') || 'OUT'}
            </span>
          ) : (
            row?.direction === 'INBOUND' && (
              <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-neargreen dark:bg-green-500/[0.15] dark:text-neargreen-300 dark:border dark:border-green-400/75 text-white text-xs font-semibold">
                {t('txnIn') || 'IN'}
              </span>
            )
          )}
        </>
      ),
      header: '',
      key: '',
      tdClassName: 'text-center',
    },
    {
      cell: (row: TransactionEvent) => (
        <>
          {row?.affected_account_id ? (
            <Tooltip
              className={'left-1/2 max-w-[200px]'}
              position="top"
              tooltip={row?.affected_account_id}
            >
              <span>
                <AddressOrTxnsLink
                  copy
                  className={'inline-block align-bottom whitespace-nowrap'}
                  currentAddress={row?.affected_account_id}
                />
              </span>
            </Tooltip>
          ) : (
            <span className="p-0.5 px-1.5">system</span>
          )}
        </>
      ),
      header: <>Affected</>,
      key: 'affected_account_id',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10  font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionEvent) => (
        <span className="whitespace-nowrap">
          {formatWithCommas(
            Number(yoctoToNear(row?.absolute_nonstaked_amount, false))?.toFixed(
              0,
            ),
          ) + '  Ⓝ'}
        </span>
      ),
      header: <span>BALANCE</span>,
      key: 'nonstaked_amount',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionEvent) => (
        <span className="whitespace-nowrap">
          {formatWithCommas(
            Number(yoctoToNear(row?.absolute_staked_amount, false))?.toFixed(0),
          ) + '  Ⓝ'}
        </span>
      ),
      header: <span>STAKED BALANCE</span>,
      key: 'staked_amount',
      tdClassName: 'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionEvent) => (
        <span>
          <Link
            className="text-green-500  dark:text-green-250 hover:no-underline"
            href={`/blocks/${row.block_height}`}
          >
            {row.block_height ? localFormat(row.block_height) : ''}
          </Link>
        </span>
      ),
      header: <span>{t('blockHeight') || ' BLOCK HEIGHT'}</span>,
      key: 'block_height',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionEvent) => (
        <span>
          <TimeStamp showAge={showAge} timestamp={row?.block_timestamp} />
        </span>
      ),
      header: (
        <div className="w-full inline-flex px-4 py-4">
          <Tooltip
            className={'-left-1'}
            position="bottom"
            tooltip={
              showAge
                ? <span className='whitespace-nowrap'>{'Click to show Datetime Format'}</span>
                : <span className='whitespace-nowrap'>{'Click to show Age Format'}</span>
            }
          >
            <button
              className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
              onClick={toggleShowAge}
              type="button"
            >
              {showAge ? t('age') || 'AGE' : t('ageDT') || 'DATE TIME (UTC)'}
              {showAge && (
                <Clock className="text-green-500 dark:text-green-250 ml-2" />
              )}
            </button>
          </Tooltip>
        </div>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 items-center text-center flex mt-2.5',
      thClassName: 'tracking-wider',
    },
  ];

  return (
    <>
      <TableSummary
        text={
          activities &&
          !error &&
          `A total of ${
            count ? localFormat && localFormat(count.toString()) : 0
          }${' '}
        records found`
        }
      />
      <Table
        columns={columns}
        cursor={cursor}
        cursorPagination={true}
        data={activities}
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
};

export default BalanceChangeActions;
