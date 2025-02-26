import React, { useEffect, useRef, useState } from 'react';
import { parseEventLogs } from '@/utils/near';
import FaRight from '../Icons/FaRight';
import { TransactionLog } from '@/utils/types';
import ArrowDownDouble from '../Icons/ArrowDownDouble';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import TokenInfo from '../common/TokenInfo';
import { localFormat } from '@/utils/app/libs';

interface ParsedEventListProps {
  events: TransactionLog[];
  totalTokenIdsCount?: number;
}

const RenderAllTransfers: React.FC<ParsedEventListProps> = ({ events }) => {
  const allTransferRef = useRef<HTMLDivElement>(null);
  const [isActionScrollable, setIsActionScrollable] = useState(false);

  useEffect(() => {
    if (allTransferRef?.current) {
      const height = allTransferRef?.current?.offsetHeight;
      setIsActionScrollable(height >= 182);
    }
  }, [events]);

  return (
    <>
      <div className="mostly-customized-scrollbar">
        <div
          className="!max-h-[182px] break-words space-y-2"
          ref={allTransferRef}
        >
          {events &&
            events?.map((event: any, index: number) => {
              const parsedEvent: any = parseEventLogs(event);
              if (
                parsedEvent?.standard === 'nep245' &&
                Array.isArray(parsedEvent?.data)
              ) {
                const eventData = parsedEvent;

                return eventData?.data?.flatMap((data: any, j: number) => {
                  const contracts = Array.isArray(data?.token_ids)
                    ? data?.token_ids.map(
                        (tokenId: string) => tokenId?.split(':')[1],
                      )
                    : data
                    ? [event?.contract]
                    : [];

                  const amounts = Array.isArray(data?.amounts)
                    ? data?.amounts
                    : data?.amount
                    ? [data?.amount]
                    : ['0'];

                  return contracts?.map(
                    (contract: string, tokenIndex: number) => (
                      <div
                        key={`${index}-${j}-${tokenIndex}`}
                        className="flex items-center flex-wrap break-all leading-7"
                      >
                        <FaRight className="inline-flex text-gray-400 text-xs mt-1 sm:!mt-0" />
                        {['mt_mint'].includes(parsedEvent?.event) ? (
                          <>
                            <div className="font-semibold text-gray px-1 flex items-center">
                              From
                              {'old_owner_id' in data && data?.old_owner_id ? (
                                <AddressOrTxnsLink
                                  className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline h-6 flex items-center"
                                  currentAddress={data?.old_owner_id}
                                />
                              ) : (
                                <span className="font-normal pl-1">system</span>
                              )}
                            </div>
                            <div className="font-semibold text-gray flex items-center">
                              To
                              {'owner_id' in data && data?.owner_id ? (
                                <AddressOrTxnsLink
                                  className="text-green-500 dark:text-green-250 font-normal pl-1 h-6 flex items-center"
                                  currentAddress={data?.owner_id}
                                />
                              ) : (
                                <span className="font-normal pl-1">system</span>
                              )}
                            </div>
                          </>
                        ) : ['mt_burn'].includes(parsedEvent?.event) ? (
                          <>
                            <div className="font-semibold text-gray px-1 flex items-center">
                              From{' '}
                              {'owner_id' in data && data?.owner_id ? (
                                <AddressOrTxnsLink
                                  className="text-green-500 dark:text-green-250 font-normal ml-0.5 hover:no-underline h-6 flex items-center"
                                  currentAddress={data?.owner_id}
                                />
                              ) : (
                                <span className="font-normal pl-1">system</span>
                              )}
                            </div>
                            <div className="font-semibold text-gray">
                              To{' '}
                              {'old_owner_id' in data && data?.old_owner_id ? (
                                <AddressOrTxnsLink
                                  className="text-green-500 dark:text-green-250 font-normal pl-1 h-6 flex items-center"
                                  currentAddress={data?.old_owner_id}
                                />
                              ) : (
                                <span className="font-normal pl-1">system</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="font-semibold text-gray px-1 flex items-center">
                              From
                              {'old_owner_id' in data && data?.old_owner_id ? (
                                <AddressOrTxnsLink
                                  className="text-green-500 dark:text-green-250 font-normal ml-0.5 hover:no-underline h-6 flex items-center"
                                  currentAddress={data?.old_owner_id}
                                />
                              ) : (
                                <span className="font-normal pl-1">system</span>
                              )}
                            </div>
                            <div className="font-semibold text-gray flex items-center">
                              To
                              {'new_owner_id' in data && data?.new_owner_id ? (
                                <AddressOrTxnsLink
                                  className="text-green-500 dark:text-green-250 font-normal ml-0.5 h-6 flex items-center"
                                  currentAddress={data?.new_owner_id}
                                />
                              ) : (
                                <span className="font-normal pl-1">system</span>
                              )}
                            </div>
                          </>
                        )}
                        <div className="font-bold pl-1">For</div>
                        <TokenInfo
                          contract={contract}
                          amount={amounts[tokenIndex] || '0'}
                          isShowText={true}
                        />
                      </div>
                    ),
                  );
                });
              }
              return null;
            })}
        </div>
      </div>
      {isActionScrollable && (
        <div className="flex text-xs text-nearblue-600 dark:text-neargray-10">
          <ArrowDownDouble className="w-4 h-4 dark:invert" />
          Scroll for more
        </div>
      )}
    </>
  );
};

const RenderNetTransfers: React.FC<ParsedEventListProps> = ({ events }) => {
  const netTransferRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const combinedTransactions = events
    ?.map((event: any) => {
      const parsedEvent: any = parseEventLogs(event);
      if (
        parsedEvent?.standard === 'nep245' &&
        Array.isArray(parsedEvent?.data)
      ) {
        return parsedEvent?.data?.reduce((acc: any[], transfer: any) => {
          if (Array.isArray(transfer?.amounts)) {
            const amounts = transfer?.amounts;
            const tokenIds = transfer?.token_ids;

            if (['mt_burn'].includes(parsedEvent?.event)) {
              amounts.forEach((amount: string, idx: number) => {
                acc.push({
                  address: transfer?.owner_id,
                  type: 'sent',
                  amount: amount,
                  token: tokenIds[idx],
                });
                acc.push({
                  address: 'system',
                  type: 'received',
                  amount: amount,
                  token: tokenIds[idx],
                });
              });
            } else if (['mt_mint'].includes(parsedEvent?.event)) {
              amounts.forEach((amount: string, idx: number) => {
                acc.push({
                  address: 'system',
                  type: 'sent',
                  amount: amount,
                  token: tokenIds[idx],
                });
                acc.push({
                  address: transfer?.owner_id,
                  type: 'received',
                  amount: amount,
                  token: tokenIds[idx],
                });
              });
            } else {
              acc.push({
                address: transfer?.old_owner_id,
                type: 'sent',
                amount: amounts[0],
                token: tokenIds[0],
              });
              acc.push({
                address: transfer?.new_owner_id,
                type: 'received',
                amount: amounts[0],
                token: tokenIds[0],
              });
            }
          }
          return acc;
        }, []);
      }
      return [];
    })
    ?.flat();

  const groupTransactions = (transactions: any[]) => {
    const grouped: Record<string, any> = {};

    transactions?.forEach(({ address, type, amount, token }: any) => {
      const key = `${address}_${type}_${token}`;
      if (!grouped[key]) {
        grouped[key] = {
          address,
          type,
          token,
          amount: BigInt(amount),
        };
      } else {
        grouped[key].amount += BigInt(amount);
      }
    });

    const groupedArray = Object.values(grouped)
      .map((transaction: any) => ({
        ...transaction,
        amount: transaction.amount.toString(),
      }))
      .sort((a: any, b: any) => {
        if (a.address === b.address) {
          if (a.type === 'sent' && b.type !== 'sent') return -1;
          if (a.type !== 'sent' && b.type === 'sent') return 1;

          return a.type.localeCompare(b.type);
        }

        return a.address.localeCompare(b.address);
      });

    return groupedArray;
  };

  const transactions = groupTransactions(combinedTransactions);

  useEffect(() => {
    if (netTransferRef?.current) {
      const height = netTransferRef?.current?.offsetHeight;
      setIsScrollable(height >= 180);
    }
  }, [transactions]);

  return (
    <>
      <div className="mostly-customized-scrollbar">
        <div
          className="max-h-[180px] break-words space-y-2"
          ref={netTransferRef}
        >
          {transactions?.map((item: any, tokenIndex: number) => {
            return (
              <div
                key={`${tokenIndex}`}
                className="flex flex-wrap break-all leading-7"
              >
                <div className="cursor-pointer flex items-center">
                  {item.address !== 'system' ? (
                    <AddressOrTxnsLink
                      className="text-green-500 dark:text-green-250 font-normal pl-1 h-6 flex items-center"
                      currentAddress={item?.address}
                    />
                  ) : (
                    <span className="font-normal pl-1">system</span>
                  )}
                </div>
                <div className="font-bold pl-1">{item?.type}</div>
                <TokenInfo
                  contract={item?.token?.split(':')[1]}
                  amount={item?.amount || '0'}
                  isShowText={true}
                />
              </div>
            );
          })}
        </div>
      </div>
      {isScrollable && (
        <div className="flex text-xs text-nearblue-600 dark:text-neargray-10">
          <ArrowDownDouble className="w-4 h-4 dark:invert" />
          Scroll for more
        </div>
      )}
    </>
  );
};

const NEPTokenTransactions: React.FC<ParsedEventListProps> = ({
  events,
  totalTokenIdsCount,
}: ParsedEventListProps) => {
  const [tabIndex, setTabIndex] = useState(1);

  const onTab = (index: number) => setTabIndex(index);
  return (
    <div>
      <div className="flex">
        <button
          className={`relative text-xs leading-4 font-medium inline-block cursor-pointer mb-3 mr-3 focus:outline-none rounded-lg  ${
            tabIndex === 1
              ? 'bg-green-600 dark:bg-green-250 text-white'
              : 'bg-neargray-700 dark:text-neargray-10 dark:bg-black-200 text-nearblue-600'
          }`}
          onClick={() => onTab(1)}
        >
          <h2 className="p-1.5">All Transfers</h2>
          {totalTokenIdsCount && (
            <div className="absolute text-white bg-neargreen text-[10px] h-4 inline-flex items-center font-semibold rounded-full ml-7 -top-2 z-10 px-[0.65em] py-[0.45em]">
              {localFormat(totalTokenIdsCount.toString())}
            </div>
          )}
        </button>
        <button
          className={`pl-1 relative text-xs leading-4 font-medium inline-block cursor-pointer mb-3 mr-3 focus:outline-none rounded-lg ${
            tabIndex === 2
              ? 'bg-green-600 dark:bg-green-250 text-white'
              : 'bg-neargray-700 dark:text-neargray-10 dark:bg-black-200 text-nearblue-600'
          }`}
          onClick={() => onTab(2)}
        >
          <h2 className="p-1.5">Net Transfers</h2>
        </button>
      </div>
      <div className={`${tabIndex === 1 ? '' : 'hidden'} `}>
        <RenderAllTransfers events={events} />
      </div>
      <div className={`${tabIndex === 2 ? '' : 'hidden'}`}>
        <RenderNetTransfers events={events} />
      </div>
    </div>
  );
};

export default NEPTokenTransactions;
