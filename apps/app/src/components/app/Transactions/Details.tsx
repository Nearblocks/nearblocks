'use client';
import Big from 'big.js';
import { isEmpty } from 'lodash';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import 'react-perfect-scrollbar/dist/css/styles.css';

import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from '@/components/ui/accordion';
import { useConfig } from '@/hooks/app/useConfig';
import { Link } from '@/i18n/routing';
import { parseEventLogs } from '@/utils/app/near';
import dayjs from '../../../utils/app/dayjs';
import {
  convertToMetricPrefix,
  dollarFormat,
  fiatValue,
  gasPercentage,
  localFormat,
  nanoToMilli,
  shortenToken,
  shortenTokenSymbol,
  tokenAmount,
  yoctoToNear,
} from '@/utils/libs';
import {
  mainActions,
  txnActionLogs,
  txnActions,
  txnAllActions,
  txnErrorMessage,
  txnLogs,
} from '@/utils/near';
import {
  ApiTxnData,
  FtsInfo,
  InventoryInfo,
  MtEventLogData,
  NftsInfo,
  TransactionInfo,
  TransactionLog,
} from '@/utils/types';

import DynamicAd from '../DynamicAd';
import ErrorMessage from '../common/ErrorMessage';
import TxnStatus from '../common/Status';
import TokenImage, { NFTImage } from '../common/TokenImage';
import Tooltip from '../common/Tooltip';
import Bolt from '../Icons/Bolt';
import FaRight from '../Icons/FaRight';
import FileSlash from '../Icons/FileSlash';
import Question from '../Icons/Question';
import EventLogs from './Action';
import Actions from './Actions';
import NEPTokenTransactions from './NEPTokenTransactions';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import { CopyButton } from '../common/CopyButton';
import { convertTimestampToTimes } from '@/utils/app/libs';
import ArrowDownDouble from '../Icons/ArrowDownDouble';
import RpcTxnStatus from '../common/RpcStatus';

interface Props {
  hash: string;
  isContract: boolean;
  loading: boolean;
  price: string;
  rpcTxn: any;
  statsData: {
    stats: Array<{
      near_price: string;
    }>;
  };
  txn: TransactionInfo;
  status: boolean;
  apiTxnActionsData: ApiTxnData;
}

const Details = (props: Props) => {
  const {
    hash,
    isContract = false,
    loading,
    price,
    rpcTxn,
    statsData,
    txn,
    status,
    apiTxnActionsData,
  } = props;
  const [more, setMore] = useState(false);
  const [utc, setUtc] = useState(true);
  const { utcTime, localTime } = convertTimestampToTimes(txn.block_timestamp);
  const { networkId } = useConfig();

  const t = useTranslations();
  const actionColumnRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isActionScrollable, setIsActionScrollable] = useState(false);

  const {
    logs: apiLogs,
    apiActionLogs,
    apiActions,
    tokenMetadata,
  } = apiTxnActionsData;
  const { fts, nfts } = useMemo(() => {
    function tokensTransfers(receipts: InventoryInfo[]) {
      let fts: FtsInfo[] = [];
      let nfts: NftsInfo[] = [];

      receipts &&
        receipts?.forEach(
          (receipt) =>
            receipt?.fts?.forEach((ft) => {
              if (ft?.ft_meta && ft.cause === 'TRANSFER') {
                if (ft?.ft_meta && Number(ft?.delta_amount) < 0) fts?.push(ft);
              } else {
                if (ft?.ft_meta) fts?.push(ft);
              }
            }),
        );
      receipts &&
        receipts?.forEach(
          (receipt) =>
            receipt?.nfts?.forEach((nft) => {
              if (
                nft?.nft_meta &&
                nft?.nft_token_meta &&
                nft?.cause === 'TRANSFER'
              ) {
                if (
                  nft?.nft_meta &&
                  nft?.nft_token_meta &&
                  Number(nft?.delta_amount) < 0
                )
                  nfts?.push(nft);
              } else {
                if (nft?.nft_meta && nft?.nft_token_meta) nfts?.push(nft);
              }
            }),
        );

      return {
        fts,
        nfts,
      };
    }

    if (txn?.receipts?.length) {
      return tokensTransfers(txn?.receipts);
    }

    return { fts: [], nfts: [] };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn]);

  function absoluteValue(number: string) {
    return new Big(number).abs().toString();
  }

  const currentPrice = statsData?.stats?.[0]?.near_price || 0;
  const [logs, actionLogs, actions, allActions, mainTxnsActions, errorMessage] =
    useMemo(() => {
      if (!isEmpty(rpcTxn)) {
        return [
          txnLogs(rpcTxn),
          txnActionLogs(rpcTxn),
          txnActions(rpcTxn),
          txnAllActions(rpcTxn),
          mainActions(rpcTxn),
          txnErrorMessage(rpcTxn),
        ];
      }
      return [[], [], undefined];

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rpcTxn]);

  const rpcAllEvents = useMemo(() => {
    if (
      actionLogs?.some(
        (log: TransactionLog) => parseEventLogs(log)?.standard === 'nep245',
      )
    ) {
      return actionLogs ?? [];
    }

    return (
      actionLogs?.filter((log: TransactionLog) => {
        const parsedLog: MtEventLogData = parseEventLogs(log);
        return parsedLog?.standard === 'nep245';
      }) ?? []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionLogs]);

  const apiAllEvents = apiActionLogs?.filter(
    (log: TransactionLog) => log?.logs?.standard === 'nep245',
  );

  const allEvents = apiAllEvents?.length > 0 ? apiAllEvents : rpcAllEvents;
  const showRow = allEvents && allEvents?.length > 0;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const row = document.getElementById('action-row');
      const column = document.getElementById('action-column');

      const mainrow = document.getElementById('mainaction-row');
      const maincolumn = document.getElementById('mainaction-column');

      if (row && column) {
        const renderedContent = Array.from(column.children).some(
          (child) => child.nodeType === 1 && child.textContent?.trim() !== '',
        );

        if (renderedContent) {
          row.style.display = 'block';
        } else {
          row.style.display = 'none';
        }
      }

      if (mainrow && maincolumn) {
        const renderedContent = Array.from(maincolumn.children).some(
          (child) => child.nodeType === 1 && child.textContent?.trim() !== '',
        );

        if (renderedContent) {
          mainrow.style.display = 'block';
        } else {
          mainrow.style.display = 'none';
        }
      }
    }
  }, [logs, actions]);

  const FailedReceipts = ({ data }: any) => {
    const failedReceiptCount = (data?.receipts_outcome || []).filter(
      (receipt: any) => receipt?.outcome?.status?.Failure,
    ).length;

    if (failedReceiptCount === 0) {
      return null;
    }
    const receiptText =
      failedReceiptCount === 1 ? 'failed receipt' : 'failed receipts';

    return (
      <div className="inline-flex w-fit text-xs text-red-500 bg-red-50 dark:bg-black ml-2 rounded text-left px-2 py-1">
        {`[${failedReceiptCount} ${receiptText}]`}
      </div>
    );
  };

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props?.className} ${props?.wrapperClassName}`}
      ></div>
    );
  };

  const hasScrolledToken =
    Number(fts?.length || 0) + Number(nfts?.length || 0) > 4;

  const filteredLogs = actionLogs?.filter((item) => {
    try {
      const logContent = item?.logs?.match(/EVENT_JSON:(\{.*\})/);
      if (logContent) {
        const jsonLog = JSON.parse(logContent[1]);
        return jsonLog?.standard !== 'nep245';
      }
      return true;
    } catch {
      return true;
    }
  });

  const rpcMainTxnsActions =
    mainTxnsActions &&
    mainTxnsActions?.map((txn) => {
      const filteredNepLogs = logs?.filter((item: any) => {
        try {
          const logContent = item?.logs?.match(/EVENT_JSON:(\{.*\})/);
          if (logContent) {
            const jsonLog = JSON.parse(logContent[1]);
            return jsonLog?.standard === 'nep245';
          }
          return false;
        } catch {
          return false;
        }
      });
      if (filteredNepLogs?.length > 0) {
        return {
          ...txn,
          logs: [...filteredNepLogs],
        };
      } else {
        return {
          ...txn,
          logs: [...txn.logs, ...filteredNepLogs],
        };
      }
    });

  const apiMainTxnsActions = apiActions?.map((txn: any) => {
    const filteredApiNepLogs = apiLogs?.filter((log: any) => {
      try {
        if (
          log?.logs?.standard === 'nep245' ||
          log?.logs?.standard === 'dip4'
        ) {
          return log;
        }
        return false;
      } catch {
        return false;
      }
    });
    if (filteredApiNepLogs?.length > 0) {
      return {
        ...txn,
        logs: [...filteredApiNepLogs],
      };
    } else {
      return {
        ...txn,
        logs: [...txn.logs, ...filteredApiNepLogs],
      };
    }
  });

  const updatedMainTxnsActions =
    apiMainTxnsActions?.length > 0 ? apiMainTxnsActions : rpcMainTxnsActions;

  const rpcTokenIdsCount = actionLogs?.reduce(
    (totalCount: number, item: any) => {
      try {
        const logContent = item?.logs?.match(/EVENT_JSON:(\{.*\})/);
        if (logContent) {
          const jsonLog = JSON.parse(logContent[1]);
          if (jsonLog?.standard === 'nep245') {
            const eventTokenIdsCount = jsonLog?.data?.reduce(
              (count: number, entry: any) => {
                return (
                  count +
                  (entry?.token_ids?.length > 0 ? entry?.token_ids?.length : 0)
                );
              },
              0,
            );
            return totalCount + eventTokenIdsCount;
          }
        }
        return totalCount;
      } catch (error) {
        console.log('Error parsing log:', error);
        return totalCount;
      }
    },
    0,
  );
  const apiTokenIdsCount = apiActionLogs?.reduce(
    (totalCount: number, item: any) => {
      try {
        if (item?.logs?.standard === 'nep245') {
          const eventTokenIdsCount = item?.logs?.data?.reduce(
            (count: number, entry: any) => {
              return (
                count +
                (entry?.token_ids?.length > 0 ? entry?.token_ids?.length : 0)
              );
            },
            0,
          );
          return totalCount + eventTokenIdsCount;
        }
        return totalCount;
      } catch (error) {
        console.log('Error parsing log:', error);
        return totalCount;
      }
    },
    0,
  );

  const totalTokenIdsCount = apiTokenIdsCount
    ? apiTokenIdsCount
    : rpcTokenIdsCount;

  useEffect(() => {
    if (actionColumnRef?.current) {
      const height = actionColumnRef?.current?.offsetHeight;
      setIsScrollable(height >= 160);
    }
  }, [filteredLogs, actions]);

  useEffect(() => {
    if (actionRef?.current) {
      const height = actionRef?.current?.offsetHeight;
      setIsActionScrollable(height >= 180);
    }
  }, [updatedMainTxnsActions]);

  return (
    <>
      {!txn ? (
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl">
          <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid dark:divide-black-200 divide-gray-200 !divide-y">
            <ErrorMessage
              icons={<FileSlash />}
              message="Sorry, we are unable to locate this transaction hash. Please try using a
        different RPC."
              mutedText={hash || ''}
            />
          </div>
        </div>
      ) : (
        <div className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid divide-gray-200 dark:divide-black-200 divide-y">
          <div className="text-sm text-nearblue-600 dark:text-neargray-10 py-2">
            {networkId === 'testnet' && (
              <div className="flex flex-wrap px-4 py-3.5 text-red-500">
                {t
                  ? t('testnetNotice')
                  : '[ This is a Testnet transaction only ]'}
              </div>
            )}

            <div className="flex flex-wrap px-4 py-3.5">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.hash.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txnDetails.hash.text.0') : 'Txn Hash'}
              </div>
              {!txn?.transaction_hash ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xl" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 font-semibold break-words">
                  {txn?.transaction_hash ? txn?.transaction_hash : ''}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-start px-4 py-3">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 h-6">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.status.tooltip')}
                >
                  <div>
                    <div>
                      <Question className="w-4 h-4 fill-current mr-1" />
                    </div>
                  </div>
                </Tooltip>
                <div>{t ? t('txnDetails.status.text.0') : 'Status'}</div>
              </div>
              {loading ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-14" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {txn?.outcomes?.status !== undefined && (
                    <div className="flex items-center flex-wrap gap-2">
                      {!status ? (
                        <RpcTxnStatus
                          showLabel
                          status={rpcTxn.status}
                          showReceipt={<FailedReceipts data={rpcTxn} />}
                        />
                      ) : (
                        <TxnStatus
                          showLabel
                          status={txn?.outcomes?.status}
                          showReceipt={<FailedReceipts data={rpcTxn} />}
                        />
                      )}
                      <div className="w-full max-w-xl">
                        {txn?.outcomes?.status === false &&
                        errorMessage === undefined ? (
                          <Loader wrapperClassName="flex w-full " />
                        ) : errorMessage ? (
                          <div className="text-xs bg-orange-50 w-full dark:bg-black-200 dark:text-nearyellow-400 rounded text-left px-2 py-1 truncate overflow-hidden whitespace-nowrap">
                            {errorMessage}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap px-4 py-3.5">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.block.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txnDetails.block.text.0') : 'Block Height'}
              </div>
              {!txn?.included_in_block_hash ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-14" />
                </div>
              ) : txn ? (
                <div className="w-full md:w-3/4 font-semibold break-words">
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                    href={`/blocks/${txn?.included_in_block_hash}`}
                  >
                    {txn?.block?.block_height
                      ? localFormat(txn?.block?.block_height)
                      : txn?.block?.block_height ?? ''}
                  </Link>
                  {txn?.block?.block_height && (
                    <span className="mx-0.5">
                      <CopyButton textToCopy={txn?.block?.block_height} />
                    </span>
                  )}
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="flex flex-wrap px-4 py-3.5">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.timestamp.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txnDetails.timestamp.text.0') : 'Timestamp'}
              </div>
              {!txn?.block_timestamp ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-sm" />
                </div>
              ) : txn ? (
                <div
                  className="w-full md:w-3/4 break-words"
                  suppressHydrationWarning
                >
                  {txn?.block_timestamp && (
                    <>
                      <span className="mr-1">
                        {dayjs().to(dayjs(nanoToMilli(txn.block_timestamp)))}
                      </span>
                      <Tooltip
                        className={'left-1/2 whitespace-nowrap max-w-[200px]'}
                        position="top"
                        tooltip={utc ? 'Switch to local time' : 'Switch to UTC'}
                      >
                        <button
                          onClick={() => setUtc((prevState) => !prevState)}
                          className="relative"
                        >
                          {`(${utc ? utcTime : localTime})`}
                        </button>
                      </Tooltip>
                    </>
                  )}
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="flex flex-wrap px-4 py-3.5">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={
                    'The shard number in which the transaction was executed in'
                  }
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Shard Number
              </div>
              {!txn?.shard_id ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-sm" />
                </div>
              ) : txn ? (
                <div className="w-full md:w-3/4 break-words">
                  {txn?.shard_id}
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
          {updatedMainTxnsActions && updatedMainTxnsActions?.length >= 0 && (
            <div
              className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10 py-1"
              id="mainaction-row"
            >
              <div className="flex items-start flex-wrap px-4 py-2.5">
                <div className="flex items-center w-full md:w-1/4 mb-0 sm:mb-2 md:mb-0 leading-7">
                  <Tooltip
                    className={'w-96 left-25 max-w-[200px]'}
                    tooltip={'Highlighted events of the transaction'}
                  >
                    <div>
                      <Bolt className="w-4 h-4 fill-current mr-1" />
                    </div>
                  </Tooltip>
                  Transaction Actions
                </div>
                {loading || updatedMainTxnsActions?.length === 0 ? (
                  <div className="w-full md:w-3/4">
                    <Loader wrapperClassName="flex w-full max-w-xl" />
                  </div>
                ) : (
                  <div
                    id="mainaction-column"
                    className="w-full md:w-3/4 align-middle"
                  >
                    <div
                      className={`${
                        isActionScrollable && 'mostly-customized-scrollbar'
                      }`}
                    >
                      <div
                        ref={actionRef}
                        className="max-h-[194px] break-words space-y-2 align-middle"
                      >
                        {updatedMainTxnsActions &&
                          updatedMainTxnsActions?.[0]?.logs?.map(
                            (event: TransactionLog, i: number) => (
                              <EventLogs
                                key={i}
                                event={event}
                                allActionLog={allActions}
                                tokenMetadata={tokenMetadata}
                              />
                            ),
                          )}
                        {updatedMainTxnsActions &&
                          (updatedMainTxnsActions[0]?.logs?.length === 0 ||
                            (() => {
                              try {
                                const logs = updatedMainTxnsActions[0]?.logs;
                                return logs?.every((log: any) => {
                                  const logData = log?.logs;
                                  const isJson =
                                    typeof logData === 'string' &&
                                    logData?.startsWith('EVENT_JSON:');
                                  if (isJson) {
                                    const parsedJson = JSON.parse(
                                      logData.replace('EVENT_JSON:', ''),
                                    );

                                    return parsedJson?.standard !== 'nep245';
                                  } else {
                                    return logData?.standard !== 'nep245';
                                  }
                                });
                              } catch (error) {
                                return false;
                              }
                            })()) &&
                          updatedMainTxnsActions?.map(
                            (action: any, i: number) => (
                              <Actions key={i} action={action} />
                            ),
                          )}
                      </div>
                    </div>
                    {isActionScrollable && (
                      <div className="flex text-xs pt-2 mt-2 text-nearblue-600 dark:text-neargray-10">
                        <ArrowDownDouble className="w-4 h-4 dark:invert" />
                        Scroll for more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {((txn && Object.keys(txn).length > 0) ||
            (rpcTxn && Object.keys(rpcTxn).length > 0)) && (
            <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10 overflow-hidden py-1">
              <div className="flex flex-wrap px-4 py-2">
                <div className="flex items-start w-full md:w-1/4 mb-2 md:mb-0">
                  <Tooltip
                    className={'w-96 left-[103px] max-w-[202px]'}
                    tooltip={'Sponsored banner advertisement'}
                  >
                    <div>
                      <Question className="w-4 h-4 fill-current mr-1 !mt-[3px]" />
                    </div>
                  </Tooltip>
                  Sponsored:
                </div>
                <div className="w-full md:w-3/4 lg:h-[90px] h-[100px] break-all overflow-auto ">
                  <DynamicAd
                    className="lg:!max-w-[720px] !max-w-[300px] rounded-lg"
                    breakpoint={1024}
                    desktopUnitId="IbT2RAk1Cdc36JPkKEfCJQ=="
                    mobileUnitId="uLZF93wBs/ew1TZnm64OxQ=="
                    network="Near"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10">
            <div className="flex flex-wrap px-4 py-3">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.from.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txnDetails.from.text.0') : 'From'}
              </div>
              {!txn?.signer_account_id ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xl" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-all">
                  <AddressOrTxnsLink
                    className="h-6"
                    copy
                    currentAddress={txn?.signer_account_id}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-wrap px-4 py-3">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.to.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {isContract
                  ? 'Interacted With (To)'
                  : t
                  ? t('txnDetails.to.text.0')
                  : 'To'}
              </div>
              {!txn?.receiver_account_id ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xl" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-all">
                  <AddressOrTxnsLink
                    className="h-6"
                    copy
                    currentAddress={txn?.receiver_account_id}
                  />
                </div>
              )}
            </div>
            <div
              id="action-row"
              className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10"
            >
              <div className="flex items-start flex-wrap pl-4 sm:!pl-2 pb-2">
                <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0"></div>
                {loading || (actions?.length === 0 && logs?.length === 0) ? (
                  <div className="w-full md:w-3/4">
                    <Loader wrapperClassName="flex w-full max-w-xl" />
                  </div>
                ) : (
                  <div className="w-full md:w-3/4 pb-1">
                    <div
                      className={`${
                        isScrollable && 'mostly-customized-scrollbar'
                      } mr-4`}
                    >
                      <div
                        id="action-column"
                        ref={actionColumnRef}
                        className="max-h-[160px] break-words space-y-1 text-xs"
                      >
                        {filteredLogs?.map(
                          (event: TransactionLog, i: number) => (
                            <EventLogs
                              key={i}
                              event={event}
                              allActionLog={allActions}
                              isInteracted
                              tokenMetadata={tokenMetadata}
                            />
                          ),
                        )}
                        {actions?.map((action: any, i: number) => (
                          <Actions key={i} action={action} />
                        ))}
                      </div>
                    </div>
                    {isScrollable && (
                      <div className="flex text-xs text-nearblue-600 dark:text-neargray-10 mt-1">
                        <ArrowDownDouble className="w-4 h-4 dark:invert" />
                        Scroll for more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {(fts?.length > 0 || nfts?.length > 0) && (
            <div className="flex items-start flex-wrap px-4 py-3.5">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 leading-7">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={'List of tokens transferred in the transaction'}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Tokens Transferred
              </div>
              {loading ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xl" />
                </div>
              ) : (
                <div className="relative w-full md:w-3/4">
                  <div className="mostly-customized-scrollbar">
                    <div className="max-h-[160px] break-words space-y-3">
                      {fts &&
                        fts?.map((ft: any, i: number) => (
                          <div
                            className="flex items-center flex-wrap break-all leading-1"
                            key={i}
                          >
                            <FaRight className="inline-flex text-gray-400 text-xs" />
                            {ft?.cause === 'MINT' ? (
                              <>
                                <div className="font-semibold text-gray px-1 flex items-center">
                                  From
                                  {ft?.involved_account_id ? (
                                    <AddressOrTxnsLink
                                      className="h-6 flex items-center ml-1"
                                      currentAddress={ft?.involved_account_id}
                                    />
                                  ) : (
                                    <span className="font-normal pl-1">
                                      system
                                    </span>
                                  )}
                                </div>
                                <div className="font-semibold text-gray px-1 flex items-center">
                                  To
                                  {ft?.affected_account_id ? (
                                    <AddressOrTxnsLink
                                      className="h-6 flex items-center ml-1"
                                      currentAddress={ft?.affected_account_id}
                                    />
                                  ) : (
                                    <span className="font-normal pl-1">
                                      system
                                    </span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="font-semibold text-gray px-1 flex items-center">
                                  From
                                  {ft?.affected_account_id ? (
                                    <AddressOrTxnsLink
                                      className="h-6 flex items-center ml-1"
                                      currentAddress={ft?.affected_account_id}
                                    />
                                  ) : (
                                    <span className="font-normal pl-1">
                                      system
                                    </span>
                                  )}
                                </div>
                                <div className="font-semibold text-gray px-1 flex items-center">
                                  To
                                  {ft?.involved_account_id ? (
                                    <AddressOrTxnsLink
                                      className="h-6 flex items-center ml-1"
                                      currentAddress={ft?.involved_account_id}
                                    />
                                  ) : (
                                    <span className="font-normal pl-1">
                                      system
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                            <div className="font-semibold text-gray px-1">
                              For
                              <span className="pl-1 font-normal">
                                {ft?.delta_amount &&
                                ft?.ft_meta?.decimals &&
                                tokenAmount
                                  ? tokenAmount(
                                      absoluteValue(ft?.delta_amount),
                                      ft?.ft_meta?.decimals,
                                      true,
                                    )
                                  : ''}
                              </span>
                            </div>

                            <Link
                              className="text-green dark:text-green-250 flex items-center hover:no-underline font-semibold"
                              href={`/token/${ft?.ft_meta?.contract}`}
                            >
                              <TokenImage
                                alt={ft?.ft_meta?.name}
                                className="w-4 h-4 mx-1"
                                src={ft?.ft_meta?.icon}
                              />
                              {shortenToken(ft?.ft_meta?.name ?? '')}
                              <span>
                                {`(${shortenTokenSymbol(
                                  ft?.ft_meta?.symbol ?? '',
                                )})`}
                              </span>
                            </Link>
                          </div>
                        ))}
                      {nfts &&
                        nfts?.map((nft: any, i: number) => (
                          <div className="flex" key={i}>
                            <div className="flex justify-start items-start">
                              <FaRight className="inline-flex text-gray-400 text-xs mt-1" />
                              <div className="flex flex-wrap">
                                <div>
                                  <div className="sm:flex">
                                    {nft?.cause === 'MINT' ? (
                                      <>
                                        <div className="font-semibold text-gray px-1 flex items-center">
                                          From
                                          {nft?.involved_account_id ? (
                                            <AddressOrTxnsLink
                                              className="h-6 flex items-center ml-1"
                                              currentAddress={
                                                nft?.involved_account_id
                                              }
                                            />
                                          ) : (
                                            <span className="font-normal pl-1">
                                              system
                                            </span>
                                          )}
                                        </div>
                                        <div className="font-semibold text-gray px-1 flex items-center">
                                          To
                                          {nft?.affected_account_id ? (
                                            <AddressOrTxnsLink
                                              className="h-6 flex items-center ml-1"
                                              currentAddress={
                                                nft?.affected_account_id
                                              }
                                            />
                                          ) : (
                                            <span className="font-normal pl-1">
                                              system
                                            </span>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="font-semibold text-gray px-1 flex items-center">
                                          From
                                          {nft?.affected_account_id ? (
                                            <AddressOrTxnsLink
                                              className="h-6 flex items-center ml-1"
                                              currentAddress={
                                                nft?.affected_account_id
                                              }
                                            />
                                          ) : (
                                            <span className="font-normal pl-1">
                                              system
                                            </span>
                                          )}
                                        </div>
                                        <div className="font-semibold text-gray px-1 flex items-center">
                                          To
                                          {nft?.involved_account_id ? (
                                            <AddressOrTxnsLink
                                              className="h-6 flex items-center ml-1"
                                              currentAddress={
                                                nft?.involved_account_id
                                              }
                                            />
                                          ) : (
                                            <span className="font-normal pl-1">
                                              system
                                            </span>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  <div className="sm:flex mt-1">
                                    <div className="text-gray px-1">
                                      <span className="text-gray-400">
                                        For{' '}
                                      </span>
                                      <span className="pl-1 font-normal">
                                        NFT Token ID [
                                        <Link
                                          className="text-green hover:no-underline dark:text-green-250"
                                          href={`/nft-token/${nft?.nft_meta
                                            ?.contract}/${encodeURIComponent(
                                            nft?.token_id,
                                          )}`}
                                        >
                                          {shortenToken(nft?.token_id ?? '')}
                                        </Link>
                                        ]
                                      </span>
                                    </div>

                                    <Link
                                      className="text-green flex items-center hover:no-underline dark:text-green-250"
                                      href={`/nft-token/${nft?.nft_meta?.contract}`}
                                    >
                                      <TokenImage
                                        alt={nft?.nft_meta?.name}
                                        className="w-4 h-4 mx-1"
                                        src={nft?.nft_meta?.icon}
                                      />
                                      {shortenToken(nft?.nft_meta?.name ?? '')}
                                      <span>
                                        &nbsp;
                                        {`(${shortenTokenSymbol(
                                          nft?.nft_meta?.symbol ?? '',
                                        )})`}
                                      </span>
                                    </Link>
                                  </div>
                                </div>
                                <div className="border rounded ml-2 w-11 h-11 p-1">
                                  <Link
                                    className="hover:no-underline"
                                    href={`/nft-token/${nft?.nft_meta
                                      ?.contract}/${encodeURIComponent(
                                      nft?.token_id,
                                    )}`}
                                  >
                                    <NFTImage
                                      alt={nft.nft_token_meta.title}
                                      base={nft.nft_meta.base_uri}
                                      className="max-h-full rounded"
                                      media={nft.nft_token_meta.media}
                                      reference={
                                        nft.nft_meta.reference ||
                                        nft.nft_token_meta.reference
                                      }
                                    />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  {hasScrolledToken && (
                    <div className="flex text-xs pt-2 mt-2 text-nearblue-600 dark:text-neargray-10">
                      <ArrowDownDouble className="w-4 h-4 dark:invert" />
                      Scroll for more
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {showRow && (
            <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="flex items-start flex-wrap px-4 py-3.5">
                <div className="flex w-full md:w-1/4 mb-2 md:mb-0">
                  <Tooltip
                    tooltip={
                      'List of NEP-245 tokens transferred in the transaction'
                    }
                    className={'w-96 left-25 max-w-[200px]'}
                  >
                    <span className="flex items-center">
                      <Question className="w-4 h-4 fill-current" />
                    </span>
                  </Tooltip>
                  <span className="-mt-0.5 pl-1 flex-wrap sm:flex-nowarp flex">
                    NEP-245 Tokens Transferred
                  </span>
                </div>
                {loading ? (
                  <div className="w-full md:w-3/4">
                    <Loader wrapperClassName="flex w-full max-w-xs" />
                  </div>
                ) : (
                  <div className="relative w-full md:w-3/4">
                    <NEPTokenTransactions
                      events={allEvents}
                      totalTokenIdsCount={totalTokenIdsCount}
                      tokenMetadata={tokenMetadata}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10 py-1">
            <div className="flex flex-wrap px-4 py-3.5">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.deposit.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txnDetails.deposit.text.0') : 'Deposit Value'}
              </div>
              {loading ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xs" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  <Tooltip
                    className={'w-96 left-25 max-w-[200px]'}
                    tooltip={t('txnDetails.deposit.tooltip')}
                  >
                    <span>
                      {txn?.actions_agg?.deposit
                        ? yoctoToNear(txn.actions_agg?.deposit, true)
                        : txn?.actions_agg?.deposit ?? ''}{' '}
                      Ⓝ
                      {currentPrice && networkId === 'mainnet'
                        ? ` ($${fiatValue(
                            yoctoToNear(txn.actions_agg?.deposit ?? 0, false),
                            currentPrice,
                          )})`
                        : ''}
                    </span>
                  </Tooltip>
                </div>
              )}
            </div>
            <div className="flex flex-wrap px-4 py-3.5">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.fee.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txnDetails.fee.text.0') : 'Transaction fee'}
              </div>
              {!txn?.outcomes_agg?.transaction_fee ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xs" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {txn?.outcomes_agg?.transaction_fee
                    ? yoctoToNear(txn?.outcomes_agg?.transaction_fee, true)
                    : txn?.outcomes_agg?.transaction_fee ?? ''}{' '}
                  Ⓝ
                  {currentPrice && networkId === 'mainnet'
                    ? ` ($${fiatValue(
                        yoctoToNear(
                          txn.outcomes_agg?.transaction_fee ?? 0,
                          false,
                        ),
                        currentPrice,
                      )})`
                    : ''}
                </div>
              )}
            </div>
          </div>
          {networkId === 'mainnet' && price && (
            <div className="flex flex-wrap px-4 py-3.5">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className={'w-96 left-25 max-w-[200px]'}
                  tooltip={t('txnDetails.price.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txnDetails.price.text.0') : 'Ⓝ Price'}
              </div>
              {loading ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-32" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {price ? `$${dollarFormat(price)} / Ⓝ` : 'N/A'}
                </div>
              )}
            </div>
          )}

          <AccordionRoot collapsible>
            <AccordionItem value="">
              <AccordionItemContent className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid divide-gray-200 divide-y dark:border-black-200 border-b py-0">
                <div className="py-1">
                  <div className="flex flex-wrap px-4 py-3.5">
                    <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                      <Tooltip
                        className={'w-96 left-32 max-w-[250px]'}
                        tooltip={t('txnDetails.gas.tooltip')}
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </Tooltip>
                      {t('txnDetails.gas.text.0')}
                    </div>
                    {!txn?.outcomes_agg?.gas_used ? (
                      <div className="w-full md:w-3/4">
                        <Loader wrapperClassName="flex w-full max-w-xs" />
                      </div>
                    ) : (
                      <div className="w-full md:w-3/4 break-words">
                        {convertToMetricPrefix(
                          txn?.actions_agg?.gas_attached ?? 0,
                        ) + 'gas'}
                        <span className="text-gray-300 px-1">|</span>
                        {convertToMetricPrefix(
                          txn?.outcomes_agg?.gas_used ?? 0,
                        )}
                        gas
                        {`(${gasPercentage(
                          txn?.outcomes_agg?.gas_used ?? 0,
                          txn?.actions_agg?.gas_attached ?? 0,
                        )})`}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap px-4 py-3">
                    <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                      <Tooltip
                        className={'w-96 left-25 max-w-[200px]'}
                        position="top"
                        tooltip={t('txnDetails.burnt.tooltip')}
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </Tooltip>
                      {t('txnDetails.burnt.text.0')}
                    </div>
                    {!txn?.receipt_conversion_tokens_burnt ||
                    !txn?.receipt_conversion_gas_burnt ? (
                      <div className="w-full md:w-3/4">
                        <Loader wrapperClassName="flex w-full max-w-xs" />
                      </div>
                    ) : (
                      <div className="w-full  text-xs items-center flex md:w-3/4 break-words">
                        <div className="bg-orange-50 dark:bg-black-200 rounded-md px-2 py-1">
                          <span className="text-xs mr-2">🔥</span>
                          {convertToMetricPrefix(
                            txn?.receipt_conversion_gas_burnt ?? 0,
                          ) + 'gas'}
                          <span className="text-gray-300 dark:text-neargray-10 px-1">
                            |
                          </span>{' '}
                          {txn?.receipt_conversion_tokens_burnt
                            ? yoctoToNear(
                                txn.receipt_conversion_tokens_burnt,
                                true,
                              )
                            : txn?.receipt_conversion_tokens_burnt ?? ''}{' '}
                          Ⓝ
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionItemContent>
              <div className="flex flex-wrap px-4 py-3.5">
                <AccordionItemTrigger
                  buttonColor="text-green-500 dark:text-green-250"
                  className="focus:outline-none text-green-500 dark:text-green-250 flex items-center cursor-pointer"
                  indicatorPlacement="start"
                  onClick={() => setMore((m) => !m)}
                >
                  {!more ? 'Click to see more' : 'Click to see less'}
                </AccordionItemTrigger>
              </div>
            </AccordionItem>
          </AccordionRoot>
        </div>
      )}
    </>
  );
};
export default Details;
