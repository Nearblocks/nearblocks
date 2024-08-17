import { TransactionInfo } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { localFormat } from '@/utils/libs';
import Link from 'next/link';
import Big from 'big.js';
import { tokenAmount } from '@/utils/near';
import TxnStatus from '@/components/common/Status';
import { useRouter } from 'next/router';
import FaLongArrowAltRight from '@/components/Icons/FaLongArrowAltRight';
import Clock from '@/components/Icons/Clock';
import Skeleton from '@/components/skeleton/common/Skeleton';
import TimeStamp from '@/components/common/TimeStamp';
import Filters from '@/components/common/Filters';
import Table from '@/components/common/Table';
import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';

interface Props {
  txns: TransactionInfo[];
  count: number;
  cursor: string;
  error: boolean;
  tab: string;
}

export default function Transfers({ txns, count, cursor, error, tab }: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const [showAge, setShowAge] = useState(true);
  const errorMessage = t ? t('txns:noTxns') : 'No transactions found!';
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

  const onAllClear = () => {
    const { cursor, a, p, ...newQuery } = router.query;

    router.push({
      pathname: router.pathname,
      query: newQuery,
    });
  };

  const columns = [
    {
      header: '',
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
      header: <span>{t ? t('hash') : 'HASH'}</span>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <>
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
        </>
      ),
      tdClassName: 'px-5 py-4 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-3 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>BLOCK</span>,
      key: 'block.block_height',
      cell: (row: TransactionInfo) => (
        <>
          <Link
            href={`/blocks/${row?.included_in_block_hash}`}
            className="text-green-500 dark:text-green-250 font-medium hover:no-underline"
          >
            {row?.block?.block_height
              ? localFormat(row?.block?.block_height)
              : row?.block?.block_height ?? ''}
          </Link>
        </>
      ),
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('type') : 'TYPE'}</span>,
      key: 'cause',
      cell: (row: TransactionInfo) => (
        <>
          <Tooltip
            label={row?.cause}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </Tooltip>
        </>
      ),
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>From</span>,
      key: 'affected_account_id',
      cell: (row: TransactionInfo) => {
        return Number(row.delta_amount) < 0 ? (
          <>
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
          </>
        ) : (
          <>
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
          </>
        );
      },
      tdClassName:
        'px-5 py-3 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: '',
      key: '',
      cell: (row: TransactionInfo) =>
        row?.involved_account_id === row?.affected_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
            {t ? t('txns:txnSelf') : 'Self'}
          </span>
        ) : (
          <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
            <FaLongArrowAltRight />
          </div>
        ),
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
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>Quantity</span>,
      key: 'amount',
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
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: (
        <>
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
              className="text-left text-xs px-5 py-4 w-full flex items-center font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex-row whitespace-nowrap"
            >
              {showAge ? (
                <>
                  {t ? t('token:fts.age') : 'AGE'}
                  <Clock className="text-green-500 dark:text-green-250 ml-2" />
                </>
              ) : (
                <> {t ? t('token:fts.ageDT') : 'DATE TIME (UTC)'}</>
              )}
            </button>
          </Tooltip>
        </>
      ),
      key: 'block_timestamp',
      cell: (row: TransactionInfo) => (
        <span>
          <TimeStamp timestamp={row?.block_timestamp} showAge={showAge} />
        </span>
      ),
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
    },
  ];

  function removeCursor() {
    const queryParams = router.query;
    const { cursor, order, p, tab, ...rest } = queryParams;
    return rest;
  }

  const modifiedFilter = removeCursor();

  return (
    <>
      {tab === 'transfers' ? (
        <>
          {!txns ? (
            <div className="pl-3 max-w-sm py-5 h-[60px]">
              <Skeleton className="h-4" />
            </div>
          ) : (
            <div className={`flex flex-col lg:flex-row pt-4`}>
              <div className="flex flex-col">
                <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
                  {txns &&
                    count &&
                    txns.length > 0 &&
                    `A total of ${localFormat(
                      count?.toString(),
                    )} transactions found`}
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
            data={txns}
            limit={25}
            cursorPagination={true}
            page={page}
            setPage={setPage}
            cursor={cursor}
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
      ) : (
        <div className="w-full h-[500px]"></div>
      )}
    </>
  );
}
