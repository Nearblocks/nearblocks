'use client';
import { useSearchParams } from 'next/navigation';
import {
  getTimeAgoString,
  holderPercentage,
  localFormat,
  nanoToMilli,
  serialNumber,
} from '@/utils/libs';
import { HoldersPropsInfo, Token } from '@/utils/types';

import ErrorMessage from '../../common/ErrorMessage';
import Table from '../../common/Table';
import Tooltip from '../../common/Tooltip';
import FaInbox from '../../Icons/FaInbox';
import Skeleton from '../../skeleton/common/Skeleton';
import { AddressOrTxnsLink } from '../../common/HoverContextProvider';

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
  tokens: Token;
}

const NFTHolders = ({ count, error, holder, status, tab, tokens }: Props) => {
  const errorMessage = 'No token holders found!';
  const searchParams = useSearchParams();
  const page = searchParams?.get('page');
  const currentPage = Number(page) || 1;

  const columns: any = [
    {
      cell: (_row: HoldersPropsInfo, index: number) => (
        <span>{serialNumber(index, currentPage, 25)}</span>
      ),
      header: <span>Rank</span>,
      key: '',
      tdClassName:
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-[50px]',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-[50px]',
    },
    {
      cell: (row: HoldersPropsInfo) => (
        <span>
          <Tooltip
            className={'ml-12 max-w-[200px]'}
            position="top"
            tooltip={row?.account}
          >
            <AddressOrTxnsLink
              copy
              className={
                'truncate max-w-[200px] inline-block whitespace-nowrap'
              }
              currentAddress={row?.account}
              noHover
            />
          </Tooltip>
        </span>
      ),
      header: <span> Address</span>,
      key: 'account',
      tdClassName:
        'px-5 py-4 text-sm text-nearblue-600 dark:text-neargray-10 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: HoldersPropsInfo) => <span>{row?.quantity}</span>,
      header: <span>Quantity</span>,
      key: 'quantity',
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-[200px]',
    },
    {
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
                    className="h-0.5 bg-green-500 dark:bg-green-250"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
          </span>
        );
      },
      header: <span> Percentage</span>,
      key: 'tokens',
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
            count={count}
            data={holder}
            Error={error}
            ErrorText={
              <ErrorMessage
                icons={<FaInbox />}
                message={errorMessage || ''}
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
export default NFTHolders;
