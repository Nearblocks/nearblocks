import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';

import { useConfig } from '@/hooks/app/useConfig';
import useHash from '@/hooks/app/useHash';
import { Link } from '@/i18n/routing';
import { fiatValue, shortenAddress } from '@/utils/app/libs';
import { convertToMetricPrefix, localFormat, yoctoToNear } from '@/utils/libs';
import { ReceiptsPropsInfo } from '@/utils/types';

import Tooltip from '@/components/app/common/Tooltip';
import TxnsReceiptStatus from '@/components/app/common/TxnsReceiptStatus';
import Question from '@/components/app/Icons/Question';
import { Loader } from '@/components/app/skeleton/common/Skeleton';
import ReceiptStatus from '@/components/app/Transactions/Receipts/ReceiptStatus';
import TransactionActions from '@/components/app/Transactions/Receipts/TransactionActions';
import { CopyButton } from '@/components/app/common/CopyButton';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import FaMinimize from '@/components/app/Icons/FaMinimize';
import FaExpand from '@/components/app/Icons/FaExpand';
import useRpc from '@/hooks/app/useRpc';
import { useRpcProvider } from '@/components/app/common/RpcContext';

interface Props {
  borderFlag?: boolean;
  receipt: any | ReceiptsPropsInfo;
  polledReceipt: any | ReceiptsPropsInfo;
  statsData: {
    stats: Array<{
      near_price: string;
    }>;
  };
  rpcReceipt: any | ReceiptsPropsInfo;
}

const ReceiptRow = (props: Props) => {
  const { borderFlag, receipt, statsData, polledReceipt, rpcReceipt } = props;
  const t = useTranslations();
  const [pageHash] = useHash();
  const currentPrice = statsData?.stats?.[0]?.near_price || 0;
  const deposit = receipt?.actions?.[0]?.args?.deposit ?? 0;
  const rowRef = useRef<HTMLDivElement | null>(null);
  const { networkId } = useConfig();
  const [viewMode, setViewMode] = useState<'auto' | 'raw'>('auto');
  const [isExpanded, setIsExpanded] = useState(false);
  const lastBlockHash = useRef<null | string>(null);
  const [block, setBlock] = useState<{ height: string }>({ height: '' });
  const { rpc } = useRpcProvider();
  const { getBlockDetails } = useRpc();

  const status = receipt?.outcome?.status;

  const isSuccess =
    status &&
    (('SuccessValue' in status &&
      status.SuccessValue !== null &&
      status.SuccessValue !== undefined) ||
      'SuccessReceiptId' in status);

  const handleScroll = () => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;

    const parts = hash.split('#');
    const id = parts.length > 1 ? parts[1] : null;

    if (id && (receipt?.receipt_id || receipt?.receiptId) === id) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          rowRef.current?.scrollIntoView({
            behavior: 'smooth',
          });
        }, 100);
      });
    }
  };

  useEffect(() => {
    if (
      (receipt?.block_hash || receipt?.blockHash) &&
      (receipt?.block_hash || receipt?.blockHash) !== lastBlockHash.current &&
      !receipt?.block_height
    ) {
      lastBlockHash.current = receipt.block_hash || receipt?.blockHash;

      getBlockDetails(rpc, receipt?.block_hash || receipt?.blockHash)
        .then((resp: any) => {
          setBlock(resp?.header);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt?.block_hash, receipt?.block_height, getBlockDetails]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    handleScroll();
    window.addEventListener('hashchange', handleScroll);

    return () => {
      window.removeEventListener('hashchange', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt?.receipt_id, pageHash]);

  const logs =
    polledReceipt?.outcome?.logs && Array.isArray(polledReceipt?.outcome?.logs)
      ? polledReceipt.outcome.logs.filter(Boolean)
      : [];
  const receiptLog =
    viewMode === 'raw'
      ? logs
          .map((log: any) => {
            if (typeof log === 'string') {
              try {
                const parsed = JSON.parse(atob(log));
                return JSON.stringify(parsed, null, 2);
              } catch (error) {
                return `${log}`;
              }
            }
            return JSON.stringify(log);
          })
          .join('\n\n')
      : logs
          .map((log: any) => {
            if (typeof log === 'string') {
              if (log.includes('EVENT_JSON:')) {
                try {
                  const jsonPart = log.substring(
                    log.indexOf('EVENT_JSON:') + 'EVENT_JSON:'.length,
                  );

                  try {
                    const parsed = JSON.parse(jsonPart);
                    return JSON.stringify(parsed, null, 2);
                  } catch (directParseError) {
                    const normalized = jsonPart
                      .replace(/\\\\/g, '\\')
                      .replace(/\\"/g, '"')
                      .replace(/^"|"$/g, '');

                    try {
                      const parsed = JSON.parse(normalized);
                      return JSON.stringify(parsed, null, 2);
                    } catch (normalizeError) {
                      try {
                        let fixed = jsonPart;
                        const matches = fixed.match(/"[^"]+":"(\{[^]*?\})"/g);

                        if (matches) {
                          matches.forEach((match) => {
                            const colonIndex = match.indexOf('":"');
                            const key = match.substring(0, colonIndex + 2);
                            const nestedJson = match.substring(
                              colonIndex + 3,
                              match.length - 1,
                            );
                            const escapedJson = nestedJson.replace(/"/g, '\\"');
                            const replacement = `${key}"${escapedJson}"`;
                            const escapedMatch = match.replace(
                              /[.*+?^${}()|[\]\\]/g,
                              '\\$&',
                            );
                            fixed = fixed.replaceAll(
                              new RegExp(escapedMatch, 'g'),
                              replacement,
                            );
                          });
                        }
                        const parsed = JSON.parse(fixed);
                        return JSON.stringify(parsed, null, 2);
                      } catch (fixError) {
                        const possibleJson = jsonPart.match(/\{.*\}/);
                        if (possibleJson && possibleJson[0]) {
                          try {
                            const parsed = JSON.parse(possibleJson[0]);
                            return JSON.stringify(parsed, null, 2);
                          } catch (matchError) {
                            console.error(
                              'All parsing attempts failed:',
                              matchError,
                            );
                            return `${log}`;
                          }
                        }
                        return `${log}`;
                      }
                    }
                  }
                } catch (error) {
                  console.error('Failed to process EVENT_JSON:', error);
                  return `${log}`;
                }
              } else {
                try {
                  const parsed = JSON.parse(log);
                  return JSON.stringify(parsed, null, 2);
                } catch (error) {
                  return `${log}`;
                }
              }
            }
            return JSON.stringify(log, null, 2);
          })
          .join('\n\n');

  return (
    <div
      className="scroll-mt-10 divide-solid divide-gray-200 dark:divide-black-200 divide-y"
      ref={rowRef}
    >
      <div
        className={
          borderFlag
            ? ''
            : 'border-l-4 border-green-400 dark:border-green-250 ml-8 my-2'
        }
        id={`${receipt?.receipt_id}`}
      >
        <div className="flex flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-48 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.receipts.receipt.tooltip')}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            {t ? t('txnDetails.receipts.receipt.text.0') : 'Receipt'}
          </div>
          {!receipt ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full max-w-xs" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 font-semibold word-break">
              {receipt?.receipt_id || receipt?.receiptId}
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
            {t ? t('txnDetails.status.text.0') : 'Status'}
          </div>
          {!receipt ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-16 max-w-xl" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words">
              {receipt?.outcome?.status !== undefined && (
                <TxnsReceiptStatus showLabel status={isSuccess} />
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap px-4 py-3">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 h-6">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.block.tooltip')}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            {t ? t('txnDetails.receipts.block.text.0') : 'Block'}
          </div>
          {!block?.height && !receipt?.block_height ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-28 max-w-xs" />
            </div>
          ) : receipt?.block_height || block?.height ? (
            <div className="w-full md:w-3/4 word-break font-semibold">
              <Link
                className="text-green-500 dark:text-green-250 hover:no-underline"
                href={`/blocks/${receipt.block_hash || receipt?.blockHash}`}
              >
                {localFormat(receipt?.block_height || block?.height)}
              </Link>
              {(receipt?.block_height || block?.height) && (
                <span className="mx-0.5">
                  <CopyButton
                    textToCopy={receipt?.block_height || block?.height}
                  />
                </span>
              )}
            </div>
          ) : (
            ''
          )}
        </div>
        <div>
          <div className="flex flex-wrap px-4 py-3">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 h-6">
              <Tooltip
                className={'w-96 left-25 max-w-[200px]'}
                tooltip={t('txnDetails.receipts.from.tooltip')}
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txnDetails.receipts.from.text.0') : 'From'}
            </div>
            {!receipt ? (
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-72 max-w-sm" />
              </div>
            ) : receipt?.predecessor_id || receipt?.predecessorId ? (
              <div className="w-full md:w-3/4 word-break h-6">
                <AddressOrTxnsLink
                  copy
                  currentAddress={
                    receipt?.predecessor_id || receipt?.predecessorId
                  }
                />
                {(((receipt?.receipt?.Action?.signer_public_key ||
                  receipt?.receipt?.Action?.signerPublicKey) &&
                  (receipt?.receipt?.Action?.signer_id ||
                    receipt?.receipt?.Action?.signerId)) ||
                  ((receipt?.predecessor_id || receipt?.predecessorId) &&
                    (receipt?.public_key || receipt?.publicKey))) && (
                  <Tooltip
                    tooltip="Access key used for this receipt"
                    className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                  >
                    <span>
                      &nbsp;
                      <Link
                        href={`/address/${
                          receipt?.predecessor_id ||
                          receipt?.predecessorId ||
                          receipt?.receipt?.Action?.signer_id ||
                          receipt?.receipt?.Action?.signerId
                        }?tab=accesskeys`}
                        className="text-green-500 dark:text-green-250 hover:no-underline"
                      >
                        (
                        {shortenAddress(
                          receipt?.public_key ||
                            receipt?.publicKey ||
                            receipt?.receipt?.Action?.signer_public_key ||
                            receipt?.receipt?.Action?.signerPublicKey,
                        )}
                        )
                      </Link>
                    </span>
                  </Tooltip>
                )}
              </div>
            ) : (
              ''
            )}
          </div>
          <div className="flex flex-wrap px-4 py-3">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 h-6">
              <Tooltip
                className={'w-96 left-25 max-w-[200px]'}
                tooltip={t('txnDetails.receipts.to.tooltip')}
              >
                <div>
                  <Question className="w-4 h-4 fill-current mr-1" />
                </div>
              </Tooltip>
              {t ? t('txnDetails.receipts.to.text.0') : 'To'}
            </div>
            {!receipt ? (
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-72 max-w-xs" />
              </div>
            ) : receipt?.receiver_id || receipt?.receiverId ? (
              <div className="w-full md:w-3/4 word-break h-6">
                <AddressOrTxnsLink
                  copy
                  currentAddress={receipt?.receiver_id || receipt?.receiverId}
                />
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
        <div className="flex flex-wrap px-4 py-3">
          <div className="flex items-center w-full md:w-1/4 mb-3 md:mb-0 h-6">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.receipts.burnt.tooltip')}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            {t
              ? t('txnDetails.receipts.burnt.text.0')
              : 'Burnt Gas & Tokens by Receipt'}
          </div>
          {!receipt ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-36" />
            </div>
          ) : receipt?.outcome?.gas_burnt || receipt?.outcome?.gasBurnt ? (
            <div className="w-full items-center text-xs flex md:w-3/4 break-words h-6">
              <div className="bg-orange-50  dark:bg-black-200 rounded-md px-2 py-1">
                <span className="text-xs mr-2">🔥 </span>
                {receipt?.outcome?.gas_burnt || receipt?.outcome?.gasBurnt
                  ? convertToMetricPrefix(
                      receipt?.outcome?.gas_burnt || receipt?.outcome?.gasBurnt,
                    ) + 'gas'
                  : ''}
                <span className="text-gray-300 px-1">|</span>{' '}
                {receipt?.outcome?.tokens_burnt || receipt?.outcome?.tokensBurnt
                  ? yoctoToNear(
                      receipt?.outcome?.tokens_burnt ||
                        receipt?.outcome?.tokensBurnt,
                      true,
                    )
                  : ''}{' '}
                Ⓝ
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="flex items-start flex-wrap px-4 py-2.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0 sm:mt-1">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.receipts.actions.tooltip')}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            {t ? t('txnDetails.receipts.actions.text.0') : 'Actions'}
          </div>
          {!polledReceipt ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full my-1 max-w-xs" />
              <Loader wrapperClassName="flex w-full !h-28" />
            </div>
          ) : polledReceipt?.actions ? (
            <div className="w-full md:w-3/4 word-break space-y-4">
              {polledReceipt &&
                polledReceipt?.actions?.map((action: any, i: number) => {
                  return (
                    <TransactionActions
                      action={action}
                      key={i}
                      receiver={
                        polledReceipt?.receiver_id || polledReceipt?.receiverId
                      }
                      rpcAction={rpcReceipt?.actions}
                    />
                  );
                })}
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="flex items-start flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={'Deposit value attached with the receipt'}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            Value
          </div>
          {!receipt ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-72" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words space-y-4">
              {receipt && deposit ? yoctoToNear(deposit, true) : deposit ?? '0'}{' '}
              Ⓝ
              {currentPrice && networkId === 'mainnet'
                ? ` ($${fiatValue(
                    yoctoToNear(deposit ?? 0, false),
                    currentPrice,
                  )})`
                : ''}
            </div>
          )}
        </div>
        <div className="flex items-start flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.receipts.result.tooltip')}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            {t ? t('txnDetails.receipts.result.text.0') : 'Result'}
          </div>
          {!polledReceipt ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-72" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words space-y-4">
              {polledReceipt ? <ReceiptStatus receipt={polledReceipt} /> : ''}
            </div>
          )}
        </div>
        <div className="flex items-start flex-wrap px-4 py-3.5">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
            <Tooltip
              className={'w-96 left-25 max-w-[200px]'}
              tooltip={t('txnDetails.receipts.logs.tooltip')}
            >
              <div>
                <Question className="w-4 h-4 fill-current mr-1" />
              </div>
            </Tooltip>
            {t ? t('txnDetails.receipts.logs.text.0') : 'Logs'}
          </div>
          {!polledReceipt ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full !h-20" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words space-y-4">
              {polledReceipt?.outcome?.logs?.length > 0 ? (
                <div className="relative w-full pt-1">
                  <div className="absolute top-2 mt-1 sm:!mr-4 right-2 flex">
                    <button
                      onClick={() => setViewMode('auto')}
                      className={`px-3 py-1 rounded-l-lg text-sm ${
                        viewMode === 'auto'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-200 dark:bg-black-300 text-gray-700 dark:text-neargray-10'
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-3 py-1 rounded-r-lg text-sm ${
                        viewMode === 'raw'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-200 dark:bg-black-300 text-gray-700 dark:text-neargray-10'
                      }`}
                    >
                      Raw
                    </button>
                    <button
                      onClick={() => setIsExpanded((prev) => !prev)}
                      className="bg-gray-700 dark:bg-gray-500 bg-opacity-10 hover:bg-opacity-100 group rounded-full p-1.5 w-7 h-7 ml-1.5"
                    >
                      {!isExpanded ? (
                        <FaMinimize className="fill-current -z-50 text-gray-700 dark:text-neargray-10 group-hover:text-white h-4 w-4" />
                      ) : (
                        <FaExpand className="fill-current -z-50 text-gray-700 dark:text-neargray-10 group-hover:text-white h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div
                    className={`block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 resize-y font-space-mono whitespace-pre-wrap overflow-auto max-w-full overflow-x-auto  ${
                      !isExpanded ? 'h-[8rem]' : ''
                    }`}
                  >
                    {receiptLog}
                  </div>
                </div>
              ) : (
                <p>No Logs</p>
              )}
            </div>
          )}
        </div>
      </div>
      {receipt?.outcome?.outgoing_receipts?.length > 0 && (
        <div className="pb-4">
          {receipt?.outcome?.outgoing_receipts?.map((rcpt: any) => {
            const matchingReceipt =
              polledReceipt?.outcome?.outgoing_receipts?.find(
                (rpcRcpt: any) =>
                  (rpcRcpt?.receipt_id || rpcRcpt?.receiptId) ===
                  (rcpt?.receipt_id || rcpt?.receiptId),
              );
            const matchingRpcReceipt =
              rpcReceipt?.outcome?.outgoing_receipts?.find(
                (rpcRcpt: any) =>
                  rpcRcpt?.id === rcpt?.receipt_id || rcpt?.receiptId,
              );
            return (
              <div className="pl-4 pt-6" key={rcpt?.receipt_id}>
                <div className="mx-4 border-l-4 border-l-gray-200">
                  <ReceiptRow
                    borderFlag
                    receipt={rcpt}
                    statsData={statsData}
                    polledReceipt={matchingReceipt}
                    rpcReceipt={matchingRpcReceipt}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ReceiptRow;
