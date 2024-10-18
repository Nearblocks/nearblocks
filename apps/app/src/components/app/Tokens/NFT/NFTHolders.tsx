'use client';
import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';
import Skeleton from '@/components/skeleton/common/Skeleton';
import { Link } from '@/i18n/routing';
import {
  getTimeAgoString,
  holderPercentage,
  localFormat,
  nanoToMilli,
  serialNumber,
} from '@/utils/libs';
import { HoldersPropsInfo, Token } from '@/utils/types';
import { Tooltip } from '@reach/tooltip';
import { useSearchParams } from 'next/navigation';
import Table from '../../common/Table';

interface Props {
  tokens: Token;
  status: {
    height: string;
    sync: true;
    timestamp: '';
  };
  holder: HoldersPropsInfo[];
  count: number;
  error: boolean;
  tab: string;
}

const NFTHolders = ({ tokens, status, holder, count, error, tab }: Props) => {
  const errorMessage = 'No token holders found!';
  const searchParams = useSearchParams();
  const page = searchParams?.get('page');
  const currentPage = Number(page) || 1;

  const columns: any = [
    {
      header: <span>Rank</span>,
      key: '',
      cell: (_row: HoldersPropsInfo, index: number) => (
        <span>{serialNumber(index, currentPage, 25)}</span>
      ),
      tdClassName:
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-[50px]',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-[50px]',
    },
    {
      header: <span> Address</span>,
      key: 'account',
      cell: (row: HoldersPropsInfo) => (
        <span>
          <Tooltip
            label={row?.account}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <span className="truncate max-w-[200px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap">
              <Link
                href={`/address/${row?.account}`}
                className="text-green-500 dark:text-green-250 font-medium hover:no-undeline"
              >
                {row?.account}
              </Link>
            </span>
          </Tooltip>
        </span>
      ),
      tdClassName:
        'px-5 py-4 text-sm text-nearblue-600 dark:text-neargray-10 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>Quantity</span>,
      key: 'quantity',
      cell: (row: HoldersPropsInfo) => <span>{row?.quantity}</span>,
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-[200px]',
    },
    {
      header: <span> Percentage</span>,
      key: 'tokens',
      cell: (row: HoldersPropsInfo) => {
        const percentage =
          Number(tokens?.tokens) > 0
            ? holderPercentage(tokens?.tokens, row?.quantity)
            : null;
        return (
          <span>
            {percentage === null ? 'N/A' : `${percentage}%`}
            {percentage !== null &&
              Number(percentage) <= 100 &&
              Number(percentage) >= 0 && (
                <div className="h-0.5 mt-1 w-full bg-gray-100">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-0.5 bg-green-500 dark:bg-green-250"
                  />
                </div>
              )}
          </span>
        );
      },
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-[300px] ',
    },
  ];

  return (
    <>
      {tab === 'holders' ? (
        <>
          {!count ? (
            <div className="pl-6 max-w-lg w-full py-5 ">
              <Skeleton className="h-4" />
            </div>
          ) : (
            <>
              {!status?.sync && (
                <div className="w-full text-center bg-nearblue dark:bg-black-200 rounded-t-xl px-5 py-4 text-green dark:text-green-250 text-sm">
                  Holders count is out of sync. Last synced block is
                  <span className="font-bold mx-0.5">
                    {status && localFormat && localFormat(status?.height)}
                  </span>
                  {status?.timestamp &&
                    `(${getTimeAgoString(
                      nanoToMilli(status.timestamp),
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
                        count ? localFormat && localFormat(count.toString()) : 0
                      }${' '}
                token holders found`}
                  </p>
                </div>
              </div>
            </>
          )}
          <Table
            columns={columns}
            data={holder}
            isPagination={true}
            count={count}
            page={currentPage}
            limit={25}
            pageLimit={200}
            Error={error}
            ErrorText={
              <ErrorMessage
                icons={<FaInbox />}
                message={errorMessage || ''}
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
};
export default NFTHolders;
