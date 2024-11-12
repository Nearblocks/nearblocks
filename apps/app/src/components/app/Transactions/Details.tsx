'use client';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@reach/accordion';
import { Tooltip } from '@reach/tooltip';
import Big from 'big.js';
import { isEmpty } from 'lodash';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

import ErrorMessage from '@/components/common/ErrorMessage';
import FaRight from '@/components/Icons/FaRight';
import { useConfig } from '@/hooks/app/useConfig';
import { Link } from '@/i18n/routing';
import {
  convertToMetricPrefix,
  convertToUTC,
  dollarFormat,
  fiatValue,
  gasPercentage,
  getTimeAgoString,
  localFormat,
  nanoToMilli,
  shortenAddress,
  shortenToken,
  shortenTokenSymbol,
  tokenAmount,
  yoctoToNear,
} from '@/utils/libs';
import { txnActions, txnErrorMessage, txnLogs } from '@/utils/near';
import {
  FtsInfo,
  InventoryInfo,
  NftsInfo,
  TransactionInfo,
  TransactionLog,
} from '@/utils/types';

import TxnStatus from '../common/Status';
import TokenImage, { NFTImage } from '../common/TokenImage';
import ArrowDown from '../Icons/ArrowDown';
import ArrowUp from '../Icons/ArrowUp';
import Bolt from '../Icons/Bolt';
import FileSlash from '../Icons/FileSlash';
import Question from '../Icons/Question';
import EventLogs from './Action';
import Actions from './Actions';

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
  } = props;
  const [more, setMore] = useState(false);

  const { networkId } = useConfig();

  const t = useTranslations();
  const { fts, nfts } = useMemo(() => {
    function tokensTransfers(receipts: InventoryInfo[]) {
      let fts: FtsInfo[] = [];
      let nfts: NftsInfo[] = [];

      receipts &&
        receipts.forEach(
          (receipt) =>
            receipt?.fts?.forEach((ft) => {
              if (ft.ft_meta && ft.cause === 'TRANSFER') {
                if (ft.ft_meta && Number(ft.delta_amount) < 0) fts.push(ft);
              } else {
                if (ft.ft_meta) fts.push(ft);
              }
            }),
        );
      receipts &&
        receipts.forEach(
          (receipt) =>
            receipt?.nfts?.forEach((nft) => {
              if (
                nft.nft_meta &&
                nft.nft_token_meta &&
                nft.cause === 'TRANSFER'
              ) {
                if (
                  nft.nft_meta &&
                  nft.nft_token_meta &&
                  Number(nft.delta_amount) < 0
                )
                  nfts.push(nft);
              } else {
                if (nft.nft_meta && nft.nft_token_meta) nfts.push(nft);
              }
            }),
        );

      return {
        fts,
        nfts,
      };
    }

    if (txn?.receipts?.length) {
      return tokensTransfers(txn.receipts);
    }

    return { fts: [], nfts: [] };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txn]);

  function absoluteValue(number: string) {
    return new Big(number).abs().toString();
  }

  const currentPrice = statsData?.stats?.[0]?.near_price || 0;
  const [logs, actions, errorMessage] = useMemo(() => {
    if (!isEmpty(rpcTxn)) {
      return [txnLogs(rpcTxn), txnActions(rpcTxn), txnErrorMessage(rpcTxn)];
    }
    return [[], [], undefined];

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rpcTxn]);

  useEffect(() => {
    // Hide txn actions row
    if (typeof document !== 'undefined') {
      const row = document.getElementById('action-row');
      const column = document.getElementById('action-column');

      if (row && column && !column.hasChildNodes()) {
        row.style.display = 'none';
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
        className={`bg-gray-200 dark:bg-black-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

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
          <div className="text-sm text-nearblue-600 dark:text-neargray-10">
            {networkId === 'testnet' && (
              <div className="flex flex-wrap p-4 text-red-500">
                {t
                  ? t('testnetNotice')
                  : '[ This is a Testnet transaction only ]'}
              </div>
            )}

            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={t('txn.hash.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txn.hash.text.0') : 'Txn Hash'}
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
            <div className="flex flex-wrap items-start p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={t('txn.status.tooltip')}
                >
                  <div>
                    <div>
                      <Question className="w-4 h-4 fill-current mr-1" />
                    </div>
                  </div>
                </Tooltip>
                {t ? t('txn.status.text.0') : 'Status'}
              </div>
              {loading ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xl" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  {txn?.outcomes?.status !== undefined && (
                    <TxnStatus
                      showLabel
                      showReceipt={<FailedReceipts data={rpcTxn} />}
                      status={txn?.outcomes?.status}
                    />
                  )}
                  {errorMessage && (
                    <div className="text-xs bg-orange-50 dark:bg-black-200 dark:text-nearyellow-400 my-2 rounded text-left px-2 py-1">
                      {errorMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={t('txn.block.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txn.block.text.0') : 'Block Height'}
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
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={t('txn.timestamp.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txn.timestamp.text.0') : 'Timestamp'}
              </div>
              {!txn?.block_timestamp ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-sm" />
                </div>
              ) : txn ? (
                <div className="w-full md:w-3/4 break-words">
                  {`${getTimeAgoString(
                    nanoToMilli(txn?.block_timestamp || '0'),
                  )} (${convertToUTC(
                    nanoToMilli(txn?.block_timestamp || '0'),
                    true,
                  )} +UTC)`}
                </div>
              ) : (
                ''
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={
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

          <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10">
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={t('txn.from.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txn.from.text.0') : 'From'}
              </div>
              {!txn?.signer_account_id ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xl" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-all">
                  <Link
                    className="text-green-500  dark:text-green-250 hover:no-underline"
                    href={`/address/${txn?.signer_account_id}`}
                  >
                    {txn?.signer_account_id}
                  </Link>
                </div>
              )}
            </div>
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={t('txn.to.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {isContract ? 'To' : t ? t('txn.to.text.0') : 'To'}
              </div>
              {!txn?.receiver_account_id ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xl" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-all">
                  <Link
                    className="text-green-500 dark:text-green-250 hover:no-underline"
                    href={`/address/${txn?.receiver_account_id}`}
                  >
                    {txn?.receiver_account_id}
                  </Link>
                </div>
              )}
            </div>
          </div>
          {(fts?.length > 0 || nfts?.length > 0) && (
            <div className="flex items-start flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 leading-7">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={'List of tokens transferred in the transaction'}
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
                  <PerfectScrollbar>
                    <div className="max-h-[302px] break-words space-y-3">
                      {fts?.map((ft: any, i: number) => (
                        <div
                          className="flex items-center flex-wrap break-all leading-7"
                          key={i}
                        >
                          <FaRight className="inline-flex text-gray-400 text-xs" />
                          {ft?.cause === 'MINT' ? (
                            <>
                              <div className="font-semibold text-gray px-1">
                                From{' '}
                                {ft?.involved_account_id ? (
                                  <Link
                                    className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                                    href={`/address/${ft?.involved_account_id}`}
                                  >
                                    {shortenAddress(
                                      ft?.involved_account_id ?? '',
                                    )}
                                  </Link>
                                ) : (
                                  <span className="font-normal pl-1">
                                    system
                                  </span>
                                )}
                              </div>
                              <div className="font-semibold text-gray px-1">
                                To{' '}
                                {ft?.affected_account_id ? (
                                  <Link
                                    className="text-green-500 dark:text-green-250 font-normal pl-1"
                                    href={`/address/${ft?.affected_account_id}`}
                                  >
                                    {shortenAddress(
                                      ft?.affected_account_id ?? '',
                                    )}
                                  </Link>
                                ) : (
                                  <span className="font-normal pl-1">
                                    system
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-semibold text-gray px-1">
                                From{' '}
                                {ft?.affected_account_id ? (
                                  <Link
                                    className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                                    href={`/address/${ft?.affected_account_id}`}
                                  >
                                    {shortenAddress(
                                      ft?.affected_account_id ?? '',
                                    )}
                                  </Link>
                                ) : (
                                  <span className="font-normal pl-1">
                                    system
                                  </span>
                                )}
                              </div>
                              <div className="font-semibold text-gray px-1">
                                To{' '}
                                {ft?.involved_account_id ? (
                                  <Link
                                    className="text-green-500 dark:text-green-250 font-normal pl-1"
                                    href={`/address/${ft?.involved_account_id}`}
                                  >
                                    {shortenAddress(
                                      ft?.involved_account_id ?? '',
                                    )}
                                  </Link>
                                ) : (
                                  <span className="font-normal pl-1">
                                    system
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                          <div className="font-semibold text-gray px-1">
                            For{' '}
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
                            className="text-green dark:text-green-250 flex items-center hover:no-underline"
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
                      {nfts?.map((nft: any) => (
                        <div className="flex" key={nft?.key}>
                          <div className="flex justify-start items-start">
                            <FaRight className="inline-flex text-gray-400 text-xs mt-1" />
                            <div className="flex flex-wrap">
                              <div>
                                <div className="sm:flex">
                                  {nft?.cause === 'MINT' ? (
                                    <>
                                      <div className="font-semibold text-gray px-1">
                                        From{' '}
                                        {nft?.involved_account_id ? (
                                          <Link
                                            className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                                            href={`/address/${nft?.involved_account_id}`}
                                          >
                                            {shortenAddress(
                                              nft?.involved_account_id ?? '',
                                            )}
                                          </Link>
                                        ) : (
                                          <span className="font-normal pl-1">
                                            system
                                          </span>
                                        )}
                                      </div>
                                      <div className="font-semibold text-gray px-1">
                                        To{' '}
                                        {nft?.affected_account_id ? (
                                          <Link
                                            className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                                            href={`/address/${nft?.affected_account_id}`}
                                          >
                                            {shortenAddress(
                                              nft?.affected_account_id ?? '',
                                            )}
                                          </Link>
                                        ) : (
                                          <span className="font-normal pl-1">
                                            system
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="font-semibold text-gray px-1">
                                        From{' '}
                                        {nft?.affected_account_id ? (
                                          <Link
                                            className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                                            href={`/address/${nft?.affected_account_id}`}
                                          >
                                            {shortenAddress(
                                              nft?.affected_account_id ?? '',
                                            )}
                                          </Link>
                                        ) : (
                                          <span className="font-normal pl-1">
                                            system
                                          </span>
                                        )}
                                      </div>
                                      <div className="font-semibold text-gray px-1">
                                        To{' '}
                                        {nft?.involved_account_id ? (
                                          <Link
                                            className="text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                                            href={`/address/${nft?.involved_account_id}`}
                                          >
                                            {shortenAddress(
                                              nft?.involved_account_id ?? '',
                                            )}
                                          </Link>
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
                                    <span className="text-gray-400">For </span>
                                    <span className="pl-1 font-normal">
                                      NFT Token ID [
                                      <Link
                                        className="text-green hover:no-underline dark:text-green-250"
                                        href={`/nft-token/${nft?.nft_meta?.contract}/${nft?.token_id}`}
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
                                  href={`/nft-token/${nft?.nft_meta?.contract}/${nft?.token_id}`}
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
                  </PerfectScrollbar>
                </div>
              )}
            </div>
          )}
          <div className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10">
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={t('txn.deposit.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txn.deposit.text.0') : 'Deposit Value'}
              </div>
              {loading ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xs" />
                </div>
              ) : (
                <div className="w-full md:w-3/4 break-words">
                  <Tooltip
                    className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    label={t('txn.deposit.tooltip')}
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
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={t('txn.fee.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txn.fee.text.0') : 'Transaction fee'}
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
            <div className="flex flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={t('txn.price.tooltip')}
                >
                  <div>
                    <Question className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                {t ? t('txn.price.text.0') : 'Ⓝ Price'}
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
          <div
            className="bg-white dark:bg-black-600 text-sm text-nearblue-600 dark:text-neargray-10"
            id="action-row"
          >
            <div className="flex items-start flex-wrap p-4">
              <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 leading-7">
                <Tooltip
                  className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  label={'Highlighted events of the transaction'}
                >
                  <div>
                    <Bolt className="w-4 h-4 fill-current mr-1" />
                  </div>
                </Tooltip>
                Transaction Actions
              </div>
              {loading || (actions?.length === 0 && logs?.length === 0) ? (
                <div className="w-full md:w-3/4">
                  <Loader wrapperClassName="flex w-full max-w-xl" />
                </div>
              ) : (
                <div className="w-full md:w-3/4">
                  <PerfectScrollbar>
                    <div
                      className="max-h-[194px] break-words space-y-2"
                      id="action-column"
                    >
                      {logs?.map((event: TransactionLog, i: number) => (
                        <EventLogs event={event} key={i} />
                      ))}
                      {actions?.map((action: any, i: number) => (
                        <Actions action={action} key={i} />
                      ))}
                    </div>
                  </PerfectScrollbar>
                </div>
              )}
            </div>
          </div>

          <Accordion collapsible onChange={() => setMore((m) => !m)}>
            <AccordionItem>
              <AccordionPanel className="text-sm text-nearblue-600 dark:text-neargray-10 divide-solid divide-gray-200 divide-y dark:border-black-200 border-b">
                <div>
                  <div className="flex flex-wrap p-4">
                    <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                      <Tooltip
                        className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                        label={t('txn.gas.tooltip')}
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </Tooltip>
                      {t('txn.gas.text.0')}
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
                  <div className="flex flex-wrap p-4">
                    <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
                      <Tooltip
                        className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                        label={t('txn.burnt.tooltip')}
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </Tooltip>
                      {t('txn.burnt.text.0')}
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
              </AccordionPanel>
              <div className="flex flex-wrap p-4">
                <AccordionButton className="focus:outline-none">
                  {!more ? (
                    <span className="text-green-500 dark:text-green-250 flex items-center cursor-pointer">
                      Click to see more <ArrowDown className="fill-current" />
                    </span>
                  ) : (
                    <span className="text-green-500 dark:text-green-250 flex items-center cursor-pointer">
                      Click to see less <ArrowUp className="fill-current" />
                    </span>
                  )}
                </AccordionButton>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </>
  );
};
export default Details;
