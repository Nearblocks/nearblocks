import React from 'react';
import Link from 'next/link';
import { parseEventLogs } from '@/utils/near';
import FaRight from '../Icons/FaRight';
import { shortenAddress } from '@/utils/libs';
import TokenInfo from './TokenInfo';
import { TransactionLog } from '@/utils/types';
interface ParsedEventListProps {
  events: TransactionLog[];
  ftsEvents: any;
}

const NEPTokenTransactions: React.FC<ParsedEventListProps> = ({
  ftsEvents,
  events,
}: ParsedEventListProps) => {
  return (
    <>
      {events &&
        ftsEvents &&
        events?.map((event: any, index: number) => {
          const parsedEvent: any = parseEventLogs(event);
          if (
            parsedEvent?.standard === 'nep245' ||
            (parsedEvent?.standard === 'nep141' &&
              Array.isArray(parsedEvent?.data))
          ) {
            return parsedEvent?.data?.map((data: any, j: any) => {
              const apiTokenInfo = ftsEvents?.find((ft: any) => {
                return ft?.ft_meta?.contract === event?.contract;
              });
              const contract =
                Array?.isArray(data?.token_ids) && data?.token_ids?.length > 0
                  ? data?.token_ids?.[0]?.split(':')[1]
                  : '';
              const amount =
                Array.isArray(data?.amounts) && data?.amounts?.length > 0
                  ? data?.amounts[0]
                  : '0';

              return (
                <div className="flex" key={`${index}-${j}`}>
                  <div className="flex items-center flex-wrap break-all leading-7">
                    <FaRight className="inline-flex text-gray-400 text-xs" />
                    {['mt_mint'].includes(parsedEvent?.event) ||
                    ['MINT'].includes(apiTokenInfo?.cause) ? (
                      <>
                        <div className="font-semibold text-gray px-1">
                          From{' '}
                          {'old_owner_id' in data && data?.old_owner_id ? (
                            <Link
                              href={`/address/${data.old_owner_id}`}
                              className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                            >
                              {shortenAddress(data.old_owner_id)}
                            </Link>
                          ) : (
                            <span className="font-normal pl-1">system</span>
                          )}
                        </div>
                        <div className="font-semibold text-gray px-1">
                          To{' '}
                          {'owner_id' in data && data?.owner_id ? (
                            <Link
                              href={`/address/${data.owner_id}`}
                              className="text-green-500 dark:text-green-250 font-normal pl-1"
                            >
                              {shortenAddress(data.owner_id)}
                            </Link>
                          ) : (
                            <span className="font-normal pl-1">system</span>
                          )}
                        </div>
                      </>
                    ) : ['mt_burn'].includes(parsedEvent.event) ||
                      ['BURN'].includes(apiTokenInfo?.cause) ? (
                      <>
                        <div className="font-semibold text-gray px-1">
                          From{' '}
                          {'owner_id' in data && data?.owner_id ? (
                            <Link
                              className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                              href={`/address/${data.owner_id}`}
                            >
                              {shortenAddress(data.owner_id)}
                            </Link>
                          ) : (
                            <span className="font-normal pl-1">system</span>
                          )}
                        </div>
                        <div className="font-semibold text-gray px-1">
                          To{' '}
                          {'old_owner_id' in data && data?.old_owner_id ? (
                            <Link
                              className="text-green-500 dark:text-green-250 font-normal pl-1"
                              href={`/address/${data.old_owner_id}`}
                            >
                              {shortenAddress(data.old_owner_id)}
                            </Link>
                          ) : (
                            <span className="font-normal pl-1">system</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-gray px-1">
                          From{' '}
                          {'old_owner_id' in data && data?.old_owner_id ? (
                            <Link
                              href={`/address/${data.old_owner_id}`}
                              className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                            >
                              {shortenAddress(data.old_owner_id)}
                            </Link>
                          ) : (
                            <span className="font-normal pl-1">system</span>
                          )}
                        </div>
                        <div className="font-semibold text-gray px-1">
                          To{' '}
                          {'new_owner_id' in data && data?.new_owner_id ? (
                            <Link
                              href={`/address/${data.new_owner_id}`}
                              className="text-green-500 dark:text-green-250 font-normal pl-1"
                            >
                              {shortenAddress(data.new_owner_id)}
                            </Link>
                          ) : (
                            <span className="font-normal pl-1">system</span>
                          )}
                        </div>
                      </>
                    )}
                    <div className="flex items-center font-semibold text-gray px-1">
                      For{' '}
                      <span className="flex items-center pl-1 font-normal">
                        <TokenInfo
                          apiTokenInfo={apiTokenInfo}
                          contract={contract}
                          amount={amount}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              );
            });
          }
          return null;
        })}
    </>
  );
};

export default NEPTokenTransactions;
