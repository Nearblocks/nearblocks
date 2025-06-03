import React, { useEffect, useState } from 'react';
import { NetworkType, TransactionLog } from '@/utils/types';
import Link from 'next/link';
import { shortenText } from '@/utils/libs';
import { getNetworkDetails, networkFullNames } from '@/utils/near';
import IntentsIcon from '@/components/app/Icons/IntentsIcon';
import ArrowUpRightSquare from '@/components/app/Icons/ArrowUpRightSquare';
import FaRight from '@/components/app/Icons/FaRight';
import { chainAbstractionExplorerUrl } from '@/utils/app/config';
import TokenInfo from '@/components/app/common/TokenInfo';
import { useParams } from 'next/navigation';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';
import { isValidJson } from '@/utils/app/libs';

interface DataItem {
  owner_id: string;
  token_ids: string[];
  amounts: string[];
}

interface ParsedLog {
  txHash: string;
  networkType: string;
}

interface TransactionParties {
  sender: string;
  receiver: string;
}

interface Props {
  event: TransactionLog;
  data: DataItem[];
  parsedActionLogs?: any[];
  meta: any;
}

const Mint = ({ event, data, parsedActionLogs, meta }: Props) => {
  const params = useParams<{ hash: string }>();
  const hash = params?.hash;

  const [txns, setTransaction] = useState<{
    network: string | null;
    externalLink: string;
    txnsHash: string;
  } | null>(null);

  const [transactionParties, setTransactionParties] =
    useState<TransactionParties | null>(null);

  const receiverId = data[0]?.owner_id;
  const token = data[0]?.token_ids[0]?.split(':')[1];

  const tokenNetwork = getNetworkDetails(token);

  useEffect(() => {
    if (!parsedActionLogs || !receiverId) {
      return;
    }

    const relevantLog = parsedActionLogs?.find((log) => {
      return log?.parsedArgs?.sender_id && log?.parsedArgs?.receiver_id;
    });

    if (relevantLog) {
      setTransactionParties({
        sender: relevantLog?.parsedArgs?.sender_id,
        receiver: relevantLog?.parsedArgs?.receiver_id,
      });
    }

    const extractedObjects: ParsedLog[] = parsedActionLogs
      ?.map((log) => {
        try {
          const memo = log?.parsedArgs?.memo || '';
          const logs = JSON.parse(
            isValidJson(log?.parsedArgs?.msg) ? log?.parsedArgs?.msg : '{}',
          );

          const bridgedFromMatch = memo?.match(/BRIDGED_FROM:(\{.*\})/);

          if (bridgedFromMatch) {
            const bridgedFromObject = JSON.parse(
              isValidJson(bridgedFromMatch[1]) ? bridgedFromMatch[1] : '{}',
            );
            if (logs?.receiver_id === receiverId) {
              return bridgedFromObject;
            }
          }
        } catch (error) {
          console.error('Error parsing action log:', error);
        }
        return null;
      })
      .filter(Boolean) as ParsedLog[];

    if (extractedObjects?.length > 0) {
      const { txHash, networkType } = extractedObjects[0];
      const network = networkFullNames[networkType as NetworkType];

      if (tokenNetwork === network && network in chainAbstractionExplorerUrl) {
        const networkConfig =
          network &&
          chainAbstractionExplorerUrl[
            network as keyof typeof chainAbstractionExplorerUrl
          ];

        const txnsUrl =
          (networkConfig && networkConfig?.transaction?.(txHash)) || '';

        setTransaction({
          network,
          externalLink: txnsUrl,
          txnsHash: txHash,
        });
      }
    }
  }, [parsedActionLogs, receiverId, tokenNetwork]);

  const renderTokenRow = (
    token: string,
    amount: string,
    idx: number,
    isLast: boolean,
  ) => {
    const metaInfo = meta?.filter(
      (meta: any) => meta.contractId === token?.split(':')[1],
    );
    return (
      <div
        key={idx}
        className={`flex flex-wrap items-center justify-start align-middle ${
          !isLast ? 'mb-1 sm:!mb-1' : ''
        }`}
      >
        {event?.receiptId && hash ? (
          <Link href={`/txns/${hash}#execution#${event?.receiptId}`}>
            <FaRight className="text-gray-400 cursor-pointer text-xs" />
          </Link>
        ) : (
          <FaRight className="text-gray-400 text-xs" />
        )}

        <span className="font-semibold text-gray pl-1">Deposit</span>
        <TokenInfo
          contract={token?.split(':')[1]}
          amount={amount}
          isShowText={true}
          metaInfo={metaInfo}
        />
        <div className="ml-1 flex items-center">
          {transactionParties && (
            <>
              by
              <span className="text-green-500 dark:text-green-250">
                <AddressOrTxnsLink
                  className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap font-normal pl-0.5 ml-0.5 h-6"
                  currentAddress={transactionParties.sender}
                />
              </span>
            </>
          )}
        </div>
        <div className="flex items-center font-bold text-gray text-sm sm:text-xs pl-1">
          On
          <Link
            href="/address/intents.near"
            className="inline-flex items-center text-green-500 dark:text-green-250 font-normal hover:no-underline pl-1"
          >
            <IntentsIcon className="h-4 w-4 mr-1" /> intents.near
          </Link>
        </div>
        {txns && txns?.txnsHash && (
          <div className="inline-flex items-center pl-1">
            <Link
              href={txns.externalLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 dark:text-green-250 font-normal hover:no-underline inline-flex items-center justify-center"
            >
              {`(${shortenText(txns.txnsHash)} `}
              <ArrowUpRightSquare className="text-green-500 dark:text-green-250 w-4 h-4 ml-1" />
              {')'}
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="action flex flex-col justify-center break-all leading-7">
      {data?.map((item) => {
        const { token_ids, amounts } = item;
        if (token_ids && amounts && token_ids?.length === amounts?.length) {
          return token_ids.map((token, idx) =>
            renderTokenRow(
              token,
              amounts[idx],
              idx,
              idx === token_ids?.length - 1,
            ),
          );
        }
        return null;
      })}
    </div>
  );
};

export default Mint;
