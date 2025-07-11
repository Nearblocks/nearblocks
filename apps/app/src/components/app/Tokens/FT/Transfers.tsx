'use client';
import Big from 'big.js';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import { useState } from 'react';

import { Link, useIntlRouter, usePathname } from '@/i18n/routing';
import { localFormat } from '@/utils/libs';
import { tokenAmount } from '@/utils/near';
import { FilterKind, TransactionInfo } from '@/utils/types';

import ErrorMessage from '@/components/app/common/ErrorMessage';
import Filters from '@/components/app/common/Filters';
import TxnStatus from '@/components/app/common/Status';
import Table from '@/components/app/common/Table';
import Timestamp from '@/components/app/common/Timestamp';
import Tooltip from '@/components/app/common/Tooltip';
import Clock from '@/components/app/Icons/Clock';
import FaInbox from '@/components/app/Icons/FaInbox';
import FaLongArrowAltRight from '@/components/app/Icons/FaLongArrowAltRight';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import { getFilteredQueryParams } from '@/utils/app/libs';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

interface Props {
  count: number;
  cursor: string;
  error: boolean;
  tab: string;
  txns: TransactionInfo[];
}

const Transfers = ({ count, cursor, error, tab, txns }: Props) => {
  const searchParams = useSearchParams();
  const intlRouter = useIntlRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [showAge, setShowAge] = useState(true);
  const errorMessage = t ? t('noTxns') : 'No transactions found!';
  const [page, setPage] = useState(1);

  const toggleShowAge = () => setShowAge((s) => !s);

  const onAllClear = () => {
    // @ts-ignore: Unreachable code error
    intlRouter?.push(pathname);
  };

  const columns = [
    {
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus showLabel={false} status={row?.outcomes?.status} />
        </>
      ),
      header: '',
      key: '',
      tdClassName:
        'pl-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      cell: (row: TransactionInfo) => (
        <>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.transaction_hash}
          >
            <AddressOrTxnsLink
              copy
              className={
                'truncate max-w-[120px] inline-block align-bottom whitespace-nowrap'
              }
              txnHash={row?.transaction_hash}
            />
          </Tooltip>
        </>
      ),
      header: <span>{'HASH'}</span>,
      key: 'transaction_hash',
      tdClassName: 'px-5 py-4 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-3 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <>
          <Link
            className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
            href={`/blocks/${row?.included_in_block_hash}`}
          >
            {row?.block?.block_height
              ? localFormat(row?.block?.block_height)
              : row?.block?.block_height ?? ''}
          </Link>
        </>
      ),
      header: <span>BLOCK</span>,
      key: 'block.block_height',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <>
          <Tooltip
            className={'left-1/2 max-w-[200px]'}
            position="top"
            tooltip={row?.cause}
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </Tooltip>
        </>
      ),
      header: <span>{'TYPE'}</span>,
      key: 'cause',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => {
        return Number(row.delta_amount) < 0 ? (
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
          </>
        ) : (
          <>
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
          </>
        );
      },
      header: <span>From</span>,
      key: 'affected_account_id',
      tdClassName:
        'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) =>
        row?.involved_account_id === row?.affected_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
            {t ? t('txnSelf') : 'Self'}
          </span>
        ) : (
          <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
            <FaLongArrowAltRight />
          </div>
        ),
      header: '',
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
        'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <>
          {row?.delta_amount
            ? localFormat(
                tokenAmount(
                  Big(row.delta_amount).abs().toString(),
                  row?.ft?.decimals,
                  true,
                ),
              )
            : ''}
        </>
      ),
      header: <span>Quantity</span>,
      key: 'amount',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      cell: (row: TransactionInfo) => (
        <span>
          <Timestamp showAge={showAge} timestamp={row?.block_timestamp} />
        </span>
      ),
      header: (
        <>
          <Tooltip
            className={'max-w-[200px] -ml-4'}
            position="bottom"
            tooltip={
              <span className="flex flex-wrap">
                <span className="whitespace-nowrap">Click to show</span>{' '}
                <span className="whitespace-nowrap">
                  {showAge ? 'Datetime' : 'Age'} Format
                </span>
              </span>
            }
          >
            <button
              className="text-left text-xs px-5 py-4 w-full flex items-center font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex-row whitespace-nowrap"
              onClick={toggleShowAge}
              type="button"
            >
              {showAge ? (
                <>
                  {t ? t('fts.age') : 'AGE'}
                  <Clock className="text-green-500 dark:text-green-250 ml-2" />
                </>
              ) : (
                <> {t ? t('fts.ageDT') : 'DATE TIME (UTC)'}</>
              )}
            </button>
          </Tooltip>
        </>
      ),
      key: 'block_timestamp',
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
    },
  ];

  const currentParams = QueryString.parse(searchParams?.toString() || '');
  const modifiedFilter = getFilteredQueryParams(currentParams, [FilterKind.A]);

  return (
    <>
      {tab === 'transfers' ? (
        <>
          {!count ? (
            <div className="pl-3 max-w-sm py-5 h-[60px]">
              <Skeleton className="h-4" />
            </div>
          ) : (
            <div
              className={`flex flex-wrap sm:!flex-nowrap justify-between py-4 items-center`}
            >
              <div className="flex flex-col">
                <p className="leading-7 px-6 text-sm text-nearblue-600 dark:text-neargray-10">
                  {txns &&
                    !error &&
                    `A total of ${
                      count ? localFormat(count?.toString()) : 0
                    } transactions found`}
                </p>
              </div>
              {modifiedFilter && (
                <div className="lg:ml-auto  px-6">
                  <Filters filters={modifiedFilter} onClear={onAllClear} />
                </div>
              )}
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
export default Transfers;
