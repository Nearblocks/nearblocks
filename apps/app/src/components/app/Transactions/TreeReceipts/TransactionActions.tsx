'use client';
import { useEffect, useRef, useState } from 'react';
import Tooltip from '@/components/app/common/Tooltip';
import Bolt from '@/components/app/Icons/Bolt';
import ArrowDownDouble from '@/components/app/Icons/ArrowDownDouble';
import useScrollToTop from '@/hooks/app/useScrollToTop';
import ContractEvents from './ContractEvents';
import ActionEvents from './ActionEvents';
import { ParsedAction } from '@/utils/types';

interface TransactionActionsProps {
  hash: string;
  loading: boolean;
  actionparsed: ParsedAction;
}

const TransactionActions = ({
  hash,
  loading,
  actionparsed,
}: TransactionActionsProps) => {
  const actionRef = useRef<HTMLDivElement>(null);
  const { isAtBottom, scrollToTop } = useScrollToTop(actionRef);
  const [isActionScrollable, setIsActionScrollable] = useState(false);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props?.className} ${props?.wrapperClassName}`}
      ></div>
    );
  };
  useEffect(() => {
    if (actionRef?.current) {
      const height = actionRef?.current?.offsetHeight;
      setIsActionScrollable(height > 194);
    }
  }, [actionparsed]);

  return (
    <div className="bg-white border border-gray-200 dark:border-black-200 rounded-xl mb-2">
      <div
        className="dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10 py-1"
        id="mainaction-row"
      >
        <div className="px-4 py-2.5">
          <div className="flex gap-4 mb-2">
            <div className="flex items-center">
              <Tooltip
                className="w-96 left-25 max-w-[200px]"
                tooltip="Highlighted events of the transaction"
              >
                <div>
                  <Bolt className="w-6 h-6 fill-current mr-1" />
                </div>
              </Tooltip>
            </div>

            <div className="flex flex-col flex-1">
              Transaction Actions
              <div className="mt-1">
                {loading || !actionparsed?.Actions?.length ? (
                  <div className="w-full md:w-3/4">
                    <Loader wrapperClassName="flex w-full h-6 mb-2" />
                  </div>
                ) : (
                  <div>
                    <div
                      ref={actionRef}
                      className={`max-h-[194px] overflow-y-auto transition-all duration-300 ${
                        isActionScrollable
                          ? 'mostly-customized-scrollbar pr-2'
                          : ''
                      }`}
                    >
                      <div className="break-words space-y-2 align-middle">
                        {actionparsed.Actions.map(
                          (action: any, index: number) => {
                            const receiptId = action?.receiptId;
                            const type = action?.type;
                            const details = action?.details;
                            const contract = action?.contract;
                            const tokens = action?.tokens;

                            if (
                              contract &&
                              Array.isArray(tokens) &&
                              tokens.length > 1
                            ) {
                              return tokens.map((token: any, i: number) => (
                                <ContractEvents
                                  key={`${receiptId || index}-${i}`}
                                  action={{ ...action, tokens: [token] }}
                                  hash={hash}
                                />
                              ));
                            }

                            if (contract) {
                              return (
                                <ContractEvents
                                  key={index}
                                  action={action}
                                  hash={hash}
                                />
                              );
                            }

                            return (
                              <ActionEvents
                                key={index}
                                type={type}
                                details={details}
                                receiptId={receiptId}
                                action={action}
                                hash={hash}
                              />
                            );
                          },
                        )}
                      </div>
                    </div>

                    {isActionScrollable &&
                      (isAtBottom ? (
                        <button
                          className="flex text-xs pt-2 mt-2 text-nearblue-600 dark:text-neargray-10"
                          onClick={() => scrollToTop()}
                        >
                          <ArrowDownDouble
                            className="w-4 h-4 dark:invert"
                            style={{ transform: 'rotate(180deg)' }}
                          />
                          Scroll to Top
                        </button>
                      ) : (
                        <div className="flex text-xs pt-2 mt-2 text-nearblue-600 dark:text-neargray-10">
                          <ArrowDownDouble className="w-4 h-4 dark:invert" />
                          Scroll for more
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionActions;
