import React from 'react';

import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/app/libs';
import { parseEventLogs } from '@/utils/app/near';
import { MtEventLogData, TransactionLog } from '@/utils/types';

interface ParsedEventListProps {
  events: TransactionLog[];
}

const NEPTokenTransactions: React.FC<ParsedEventListProps> = ({
  events,
}: ParsedEventListProps) => {
  return (
    <>
      {events &&
        events?.map((event: any, index: number) => {
          const parsedEvent: MtEventLogData = parseEventLogs(event);
          if (
            parsedEvent?.standard === 'nep245' &&
            Array.isArray(parsedEvent.data)
          ) {
            return parsedEvent?.data?.map((data, j) => (
              <div className="flex" key={`${index}-${j}`}>
                <div className="flex items-center flex-wrap break-all leading-7">
                  <FaRight className="inline-flex text-gray-400 text-xs" />
                  {['mt_burn', 'mt_mint'].includes(parsedEvent.event) ? (
                    <>
                      <div className="font-semibold text-gray px-1">
                        From{' '}
                        {'old_owner_id' in data && data?.old_owner_id ? (
                          <Link
                            className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                            href={`/address/${data.old_owner_id}`}
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
                            className="text-green-500 dark:text-green-250 font-normal pl-1"
                            href={`/address/${data.owner_id}`}
                          >
                            {shortenAddress(data.owner_id)}
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
                            className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                            href={`/address/${data.old_owner_id}`}
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
                            className="text-green-500 dark:text-green-250 font-normal pl-1"
                            href={`/address/${data.new_owner_id}`}
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
                        amount={
                          Array.isArray(data?.amounts) &&
                          data.amounts.length > 0
                            ? data.amounts[0]
                            : '0'
                        }
                        contract={
                          Array.isArray(data?.token_ids) &&
                          data.token_ids.length > 0
                            ? data.token_ids?.[0]?.split(':')[1]
                            : ''
                        }
                      />
                    </span>
                  </div>
                </div>
              </div>
            ));
          }
          return null;
        })}
    </>
  );
};

export default NEPTokenTransactions;
