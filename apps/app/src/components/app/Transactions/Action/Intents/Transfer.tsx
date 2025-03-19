import React from 'react';
import { TransactionLog } from '@/utils/types';
import Link from 'next/link';
import FaRight from '@/components/app/Icons/FaRight';
import TokenInfo from '@/components/app/common/TokenInfo';
import IntentsIcon from '@/components/app/Icons/IntentsIcon';
import { useParams } from 'next/navigation';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

interface TokenDiffEvent {
  account_id: string;
  diff: Record<string, string>;
  intent_hash?: string;
}

interface Props {
  event: TransactionLog;
  data: TokenDiffEvent[] | TokenDiffEvent;
  meta: any;
}

const Transfer = ({ event, data, meta }: Props) => {
  const params = useParams<{ hash: string }>();
  const hash = params?.hash;

  const normalizedData: TokenDiffEvent[] = Array.isArray(data)
    ? data
    : data
    ? [data as TokenDiffEvent]
    : [];

  if (normalizedData?.length === 0) return null;

  const userSwaps = normalizedData?.reduce(
    (acc, { account_id, diff }) => {
      const swapData = acc[account_id] || { sent: [], received: [] };

      Object.entries(diff).forEach(([token, amount]) => {
        const bigIntAmount = BigInt(amount);
        if (bigIntAmount > BigInt(0)) {
          swapData?.received?.push({ token, amount });
        } else if (bigIntAmount < BigInt(0)) {
          swapData?.sent?.push({ token, amount: amount?.replace('-', '') });
        }
      });

      if (swapData?.sent?.length > 0 && swapData?.received?.length > 0) {
        acc[account_id] = swapData;
      }

      return acc;
    },
    {} as Record<
      string,
      {
        sent: { token: string; amount: string }[];
        received: { token: string; amount: string }[];
      }
    >,
  );

  const validSwaps = Object.entries(userSwaps);

  if (validSwaps?.length === 0) return null;

  return (
    <div className="flex flex-col space-y-4">
      {validSwaps.map(([account, { sent, received }]) => (
        <div
          key={account}
          className="flex flex-wrap items-center justify-start"
        >
          {event?.receiptId && hash ? (
            <Link href={`/txns/${hash}#execution#${event?.receiptId}`}>
              <FaRight className="text-gray-400 text-xs cursor-pointer" />
            </Link>
          ) : (
            <FaRight className="text-gray-400 text-xs" />
          )}
          <AddressOrTxnsLink
            className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap font-normal pl-1 h-6"
            currentAddress={account}
          />
          <span className="font-semibold text-gray pl-0.5"> Swap </span>

          {sent.map(({ token, amount }, index) => {
            const contractName = token.split(':')[1] || token;
            const metaInfo = meta?.filter(
              (meta: any) => meta.contractId === contractName,
            );
            return (
              <TokenInfo
                key={`sent-${token}-${index}`}
                contract={contractName}
                amount={amount}
                isShowText
                metaInfo={metaInfo}
              />
            );
          })}

          <span className="font-bold text-gray pl-1 text-sm whitespace-nowrap">
            For
          </span>

          {received.map(({ token, amount }, index) => {
            const contractName = token.split(':')[1] || token;
            const metaInfo = meta?.filter(
              (meta: any) => meta.contractId === contractName,
            );
            return (
              <TokenInfo
                key={`received-${token}-${index}`}
                contract={contractName}
                amount={amount}
                isShowText
                metaInfo={metaInfo}
              />
            );
          })}

          <span className="font-bold text-gray pl-1 text-sm sm:text-base flex items-center">
            On <IntentsIcon className="h-4 w-4 ml-1" />
            <AddressOrTxnsLink
              className="text-green-500 dark:text-green-250 font-normal hover:no-underline flex items-center ml-0.5 h-6"
              currentAddress={'intents.near'}
            />
          </span>
        </div>
      ))}
    </div>
  );
};

export default Transfer;
