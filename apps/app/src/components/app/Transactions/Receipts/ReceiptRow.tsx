import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { space_mono } from '@/fonts/font';
import { useConfig } from '@/hooks/app/useConfig';
import useHash from '@/hooks/app/useHash';
import { Link } from '@/i18n/routing';
import { fiatValue } from '@/utils/app/libs';
import { convertToMetricPrefix, localFormat, yoctoToNear } from '@/utils/libs';
import { ReceiptsPropsInfo } from '@/utils/types';

import Tooltip from '../../common/Tooltip';
import TxnsReceiptStatus from '../../common/TxnsReceiptStatus';
import Question from '../../Icons/Question';
import { Loader } from '../../skeleton/common/Skeleton';
import ReceiptStatus from './ReceiptStatus';
import TransactionActions from './TransactionActions';
import { CopyButton } from '../../common/CopyButton';
import { AddressOrTxnsLink } from '../../common/HoverContextProvider';

interface Props {
  block: { height: string };
  borderFlag?: boolean;
  receipt: any | ReceiptsPropsInfo;
  statsData: {
    stats: Array<{
      near_price: string;
    }>;
  };
}

const ReceiptRow = (props: Props) => {
  const { block, borderFlag, receipt, statsData } = props;
  console.log({ receipt });
  const t = useTranslations();
  const [pageHash] = useHash();
  const loading = false;
  const currentPrice = statsData?.stats?.[0]?.near_price || 0;
  const deposit = receipt?.actions?.[0]?.args?.deposit ?? 0;
  const rowRef = useRef<HTMLDivElement | null>(null);
  const { networkId } = useConfig();

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

    if (id && receipt?.receipt_id === id) {
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
    if (typeof window === 'undefined') return;

    handleScroll();
    window.addEventListener('hashchange', handleScroll);

    return () => {
      window.removeEventListener('hashchange', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt?.receipt_id, pageHash]);

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
        <div className="flex flex-wrap px-4 pt-4 pb-2">
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
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-80 max-w-xs" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 font-semibold word-break">
              {receipt?.receipt_id ? receipt?.receipt_id : ''}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-start p-4 py-2 md:h-9">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
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
          {!receipt || loading ? (
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
        <div className="flex flex-wrap px-4 py-2">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
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
          {!block?.height || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-28 max-w-xs" />
            </div>
          ) : block?.height ? (
            <div className="w-full md:w-3/4 word-break font-semibold">
              <Link
                className="text-green-500 dark:text-green-250 hover:no-underline"
                href={`/blocks/${receipt.block_hash}`}
              >
                {localFormat(block?.height)}
              </Link>
              {block?.height && (
                <span className="mx-0.5">
                  <CopyButton textToCopy={block?.height} />
                </span>
              )}
            </div>
          ) : (
            ''
          )}
        </div>
        <div>
          <div className="flex flex-wrap px-4 py-2">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
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
            {!receipt || loading ? (
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-72 max-w-sm" />
              </div>
            ) : receipt?.predecessor_id ? (
              <div className="w-full md:w-3/4 word-break">
                <AddressOrTxnsLink
                  copy
                  currentAddress={receipt?.predecessor_id}
                />
              </div>
            ) : (
              ''
            )}
          </div>
          <div className="flex flex-wrap px-4 py-2">
            <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
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
            {!receipt || loading ? (
              <div className="w-full md:w-3/4">
                <Loader wrapperClassName="flex w-72 max-w-xs" />
              </div>
            ) : receipt?.receiver_id ? (
              <div className="w-full md:w-3/4 word-break">
                <AddressOrTxnsLink copy currentAddress={receipt?.receiver_id} />
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
        <div className="flex flex-wrap px-4 py-2 md:h-9">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
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
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-36" />
            </div>
          ) : receipt?.outcome?.gas_burnt ? (
            <div className="w-full items-center text-xs flex md:w-3/4 break-words">
              <div className="bg-orange-50  dark:bg-black-200 rounded-md px-2 py-1">
                <span className="text-xs mr-2">🔥 </span>
                {receipt?.outcome?.gas_burnt
                  ? convertToMetricPrefix(receipt?.outcome?.gas_burnt) + 'gas'
                  : ''}
                <span className="text-gray-300 px-1">|</span>{' '}
                {receipt?.outcome?.tokens_burnt
                  ? yoctoToNear(receipt?.outcome?.tokens_burnt, true)
                  : ''}{' '}
                Ⓝ
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="flex items-start flex-wrap px-4 py-2">
          <div className="flex items-center w-full md:w-1/4 mb-2 md:mb-0">
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
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full my-1 max-w-xs" />
              <Loader wrapperClassName="flex w-full !h-28" />
            </div>
          ) : receipt?.actions ? (
            <div className="w-full md:w-3/4 word-break space-y-4">
              {receipt &&
                receipt?.actions?.map((action: any, i: number) => (
                  <TransactionActions
                    action={action}
                    key={i}
                    receiver={receipt?.receiver_id}
                  />
                ))}
            </div>
          ) : (
            ''
          )}
        </div>
        <div className="flex items-start flex-wrap px-4 py-2">
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
          {!receipt || loading ? (
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
        <div className="flex items-start flex-wrap px-4 py-2">
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
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-72" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words space-y-4">
              {receipt ? <ReceiptStatus receipt={receipt} /> : ''}
            </div>
          )}
        </div>
        <div className="flex items-start flex-wrap px-4 py-2">
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
          {!receipt || loading ? (
            <div className="w-full md:w-3/4">
              <Loader wrapperClassName="flex w-full !h-20" />
            </div>
          ) : (
            <div className="w-full md:w-3/4 break-words space-y-4">
              {receipt?.outcome?.logs?.length > 0 ? (
                <textarea
                  className={`block appearance-none outline-none w-full border rounded-lg bg-gray-100 dark:bg-black-200 dark:border-black-200 p-3 mt-3 resize-y ${space_mono.className}`}
                  defaultValue={receipt.outcome.logs
                    .map((log: any) => {
                      if (typeof log === 'string') {
                        const match = log.match(/EVENT_JSON:(\{.*\})/);
                        if (match) {
                          try {
                            const parsed = JSON.parse(match[1]);
                            return JSON.stringify(
                              { EVENT_JSON: parsed },
                              null,
                              2,
                            );
                          } catch (error) {
                            console.log('Error parsing JSON:', error, log);
                            return `Invalid JSON log: ${log}`;
                          }
                        } else {
                          return `${log}`;
                        }
                      }
                      return `${log || ''}`;
                    })
                    .join('\n\n')}
                  readOnly
                  rows={10}
                />
              ) : (
                <p>No Logs</p>
              )}
            </div>
          )}
        </div>
      </div>
      {receipt?.outcome?.outgoing_receipts?.length > 0 && (
        <div className="pb-4">
          {receipt?.outcome?.outgoing_receipts?.map((rcpt: any) => (
            <div className="pl-4 pt-6" key={rcpt?.receipt_id}>
              <div className="mx-4 border-l-4 border-l-gray-200">
                <ReceiptRow
                  block={block}
                  borderFlag
                  receipt={rcpt}
                  statsData={statsData}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ReceiptRow;
