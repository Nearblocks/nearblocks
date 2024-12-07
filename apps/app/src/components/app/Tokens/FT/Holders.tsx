'use client';
import { Tooltip } from '@reach/tooltip';
import { useSearchParams } from 'next/navigation';

import { Link } from '@/i18n/routing';
import {
  getTimeAgoString,
  localFormat,
  nanoToMilli,
  serialNumber,
  tokenAmount,
} from '@/utils/libs';
import { price, tokenPercentage } from '@/utils/near';
import { HoldersPropsInfo, Token } from '@/utils/types';

import ErrorMessage from '../../common/ErrorMessage';
import Table from '../../common/Table';
import FaInbox from '../../Icons/FaInbox';
import Skeleton from '../../skeleton/common/Skeleton';

interface Props {
  count: number;
  error: boolean;
  holder: HoldersPropsInfo[];
  status: {
    height: string;
    sync: true;
    timestamp: '';
  };
  tab: string;
  token: Token;
}

const Holders = ({ count, error, holder, status, tab, token }: Props) => {
  const errorMessage = 'No token holders found!';
  const searchParams = useSearchParams();
  const page = searchParams?.get('page');
  const currentPage = Number(page) || 1;

  const columns: any = [
    {
      cell: (_row: HoldersPropsInfo, index: number) => (
        <span>{serialNumber(index, currentPage, 25)}</span>
      ),
      header: 'Rank',
      key: '',
      tdClassName:
        'pl-4 pr-2 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-[50px]',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-[50]',
    },
    {
      cell: (row: HoldersPropsInfo) => (
        <span>
          <Tooltip
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
            label={row.account}
          >
            <span className="truncate max-w-[200px] inline-block align-bottom text-green-500 whitespace-nowrap">
              <Link
                className="text-green-500 dark:text-green-250 font-medium hover:no-undeline"
                href={`/address/${row.account}`}
              >
                {row.account}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      header: 'Address',
      key: 'account',
      tdClassName: 'px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: HoldersPropsInfo) => (
        <>
          {row.amount && token?.decimals
            ? localFormat(tokenAmount(row.amount, token?.decimals, true))
            : ''}
        </>
      ),
      header: 'Quantity',
      key: '',
      tdClassName:
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: HoldersPropsInfo) => {
        const percentage =
          token?.total_supply != null &&
          Number(token.total_supply) !== 0 &&
          row?.amount &&
          token?.decimals
            ? tokenPercentage(token.total_supply, row.amount, token.decimals)
            : null;
        return (
          <>
            {percentage === null
              ? 'N/A'
              : Number(percentage) >= 100
              ? '100%'
              : `${percentage}%`}
            {percentage !== null &&
              Number(percentage) <= 100 &&
              Number(percentage) >= 0 && (
                <div className="h-0.5 mt-1 w-full bg-gray-100">
                  <div
                    className="h-0.5 bg-green-500 dark:bg-green-250"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
          </>
        );
      },
      header: 'Percentage',
      key: 'total_supply',
      tdClassName:
        'px-4 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: HoldersPropsInfo) => {
        return (
          <span>
            {row.amount && token?.decimals && token?.price
              ? '$' + price(row.amount, token?.decimals, token?.price)
              : ''}
          </span>
        );
      },
      header: 'Value',
      key: 'tokens',
      tdClassName:
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
  ];

  return (
    <>
      {tab === 'holders' ? (
        <>
          {!count ? (
            <div className="pl-3 max-w-sm py-5 h-[60px]">
              <Skeleton className="h-4" />
            </div>
          ) : (
            <>
              {!status?.sync && (
                <div className="w-full text-center bg-nearblue dark:bg-black-200 rounded-t-xl px-5 py-4 text-green dark:text-green-250 text-sm">
                  Holders count is out of sync. Last synced block is
                  <span className="font-bold mx-0.5">
                    {`${status?.height && localFormat(status.height)}`}
                  </span>
                  {status?.timestamp &&
                    `(${getTimeAgoString(
                      nanoToMilli(status?.timestamp),
                    )}).`}{' '}
                  Holders data will be delayed.
                </div>
              )}
              <div className={`flex flex-col lg:flex-row pt-4`}>
                <div className="flex flex-col">
                  <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
                    {holder &&
                      !error &&
                      `A total of ${
                        count ? localFormat(count.toString()) : 0
                      }${' '}
                  token holders found`}
                  </p>
                </div>
              </div>
            </>
          )}
          <Table
            columns={columns}
            count={count}
            data={holder}
            Error={error}
            ErrorText={
              <ErrorMessage
                icons={<FaInbox />}
                message={errorMessage}
                mutedText="Please try again later"
              />
            }
            isPagination={true}
            limit={25}
            page={currentPage}
            pageLimit={200}
          />
        </>
      ) : (
        <div className="w-full h-[500px]"></div>
      )}
    </>
  );
};
export default Holders;
