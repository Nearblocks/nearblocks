import React from 'react';

import { parseEventLogs } from '@/utils/app/near';
import { MtEventLogData, TransactionLog } from '@/utils/types';

import TokenInfo from '../common/TokenInfo';
import FaRight from '../Icons/FaRight';
import { AddressDisplay } from '@/components/app/common/HoverContextProvider';

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
                <div className="flex items-center flex-wrap break-all leading-1">
                  <FaRight className="inline-flex text-gray-400 text-xs" />
                  {['mt_mint'].includes(parsedEvent.event) ? (
                    <>
                      <div className="font-semibold text-gray px-1 flex items-center">
                        From{' '}
                        {'old_owner_id' in data && data?.old_owner_id ? (
                          <AddressDisplay
                            className="h-6 flex items-center ml-1"
                            currentAddress={data.old_owner_id}
                          />
                        ) : (
                          <span className="font-normal pl-1">system</span>
                        )}
                      </div>
                      <div className="font-semibold text-gray px-1 flex items-center">
                        To{' '}
                        {'owner_id' in data && data?.owner_id ? (
                          <AddressDisplay
                            className="h-6 flex items-center ml-1"
                            currentAddress={data.owner_id}
                          />
                        ) : (
                          <span className="font-normal pl-1">system</span>
                        )}
                      </div>
                    </>
                  ) : ['mt_burn'].includes(parsedEvent.event) ? (
                    <>
                      <div className="font-semibold text-gray px-1 flex items-center">
                        From{' '}
                        {'owner_id' in data && data?.owner_id ? (
                          <AddressDisplay
                            className="h-6 flex items-center ml-1"
                            currentAddress={data.owner_id}
                          />
                        ) : (
                          <span className="font-normal pl-1">system</span>
                        )}
                      </div>
                      <div className="font-semibold text-gray px-1 flex items-center">
                        To{' '}
                        {'old_owner_id' in data && data?.old_owner_id ? (
                          <AddressDisplay
                            className="h-6 flex items-center ml-1"
                            currentAddress={data.old_owner_id}
                          />
                        ) : (
                          <span className="font-normal pl-1">system</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-gray px-1 flex items-center">
                        From{' '}
                        {'old_owner_id' in data && data?.old_owner_id ? (
                          <AddressDisplay
                            className="h-6 flex items-center ml-1"
                            currentAddress={data.old_owner_id}
                          />
                        ) : (
                          <span className="font-normal pl-1">system</span>
                        )}
                      </div>
                      <div className="font-semibold text-gray px-1 flex items-center">
                        To{' '}
                        {'new_owner_id' in data && data?.new_owner_id ? (
                          <AddressDisplay
                            className="h-6 flex items-center ml-1"
                            currentAddress={data.new_owner_id}
                          />
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
