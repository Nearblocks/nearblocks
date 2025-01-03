import React, { useEffect, useState } from 'react';
import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { TransactionLog } from '@/utils/types';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { chainAbstractionExplorerUrl } from '@/utils/config';
import { shortenText } from '@/utils/libs';
import Ethereum from '@/components/Icons/Ethereum';
import { getNetworkDetails } from '@/utils/near';
import IntentsIcon from '@/components/Icons/IntentsIcon';
import FaExternalLinkAlt from '@/components/Icons/FaExternalLinkAlt';

interface DataItem {
  owner_id: string;
  token_ids: string[];
  amounts: string[];
}

interface ParsedLog {
  txHash: string;
  networkType: string;
}

interface Props {
  event: TransactionLog;
  data: DataItem[];
  parsedActionLogs?: any[];
}

const Mint = ({ event, data, parsedActionLogs }: Props) => {
  const router = useRouter();
  const { hash } = router.query;
  const [address, setAddress] = useState<{
    network: string | null;
    externalLink: string;
    address: string;
  } | null>(null);

  const [txns, setTransaction] = useState<{
    network: string | null;
    externalLink: string;
    txnsHash: string;
  } | null>(null);

  const receiverId = data[0]?.owner_id;
  const token = data[0]?.token_ids[0]?.split(':')[1];
  const tokenNetwork = getNetworkDetails(token);

  useEffect(() => {
    if (!parsedActionLogs || !receiverId) return;

    const extractedObjects: ParsedLog[] = parsedActionLogs
      ?.map((log) => {
        try {
          const memo = log?.parsedArgs?.memo || '';
          const logs = JSON.parse(log?.parsedArgs?.msg || '{}');

          const bridgedFromMatch = memo?.match(/BRIDGED_FROM:(\{.*\})/);

          if (bridgedFromMatch) {
            const bridgedFromObject = JSON.parse(bridgedFromMatch[1]);
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
      const network = (() => {
        switch (networkType) {
          case 'eth':
            return 'ethereum';
          case 'btc':
            return 'bitcoin';
          case 'arbitrum':
          case 'sol':
            return 'solana';
          case 'base':
            return networkType;
          default:
            return null;
        }
      })();
      if (tokenNetwork === network) {
        const networkConfig = network && chainAbstractionExplorerUrl[network];
        const url = networkConfig?.address?.(receiverId) || '';
        const txnsUrl = networkConfig?.transaction?.(txHash) || '';

        setAddress({
          network,
          externalLink: url,
          address: receiverId,
        });

        setTransaction({
          network,
          externalLink: txnsUrl,
          txnsHash: txHash,
        });
      }
    }
  }, [parsedActionLogs, receiverId]);

  const renderTokenRow = (
    token: string,
    amount: string,
    idx: number,
    isLast: boolean,
  ) => (
    <div
      key={idx}
      className={`flex flex-wrap items-center ${!isLast ? 'mb-1 sm:mb-1' : ''}`}
    >
      {event?.receiptId && hash ? (
        <Link href={`/txns/${hash}#execution#${event?.receiptId}`}>
          <FaRight className="text-gray-400 cursor-pointer text-sm sm:text-xs" />
        </Link>
      ) : (
        <FaRight className="text-gray-400 text-sm sm:text-xs" />
      )}
      <span className="font-bold text-sm sm:text-xs pl-1">Deposit</span>
      <div className="inline-flex items-center pl-1">
        <TokenInfo
          contract={token?.split(':')[1]}
          amount={amount}
          isShowText={true}
        />
      </div>
      <div className="inline-flex items-center font-bold text-gray text-sm sm:text-xs pl-1">
        {address && address?.network === 'ethereum' && (
          <>
            From
            <Link
              href={address?.externalLink}
              className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap pl-1 font-normal"
            >
              <div className="inline-flex items-center">
                <div className="inline-flex items-center justify-center w-4 h-4 p-0.5 bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                  <Ethereum className="w-4 h-4 text-black-200 dark:text-neargray-10" />
                </div>
                <span className="pl-1">{shortenText(address?.address)}</span>
              </div>
            </Link>
          </>
        )}
      </div>
      <div className="inline-flex items-center">
        {txns?.txnsHash && (
          <Link
            href={txns?.externalLink || '#'}
            className="text-green-500 dark:text-green-250 font-normal hover:no-underline pl-1 inline-flex items-center justify-center gap-1"
          >
            ({shortenText(txns?.txnsHash)}{' '}
            <FaExternalLinkAlt className="text-gray-400" />)
          </Link>
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
    </div>
  );

  return (
    <div className="action flex flex-col space-y-3 break-all leading-7">
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
