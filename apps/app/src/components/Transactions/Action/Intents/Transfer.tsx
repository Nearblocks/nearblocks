import React from 'react';
import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { TransactionLog } from '@/utils/types';
import { useRouter } from 'next/router';
import Link from 'next/link';
import IntentsIcon from '@/components/Icons/IntentsIcon';
import { shortenText } from '@/utils/libs';

interface TokenDiffEvent {
  account_id: string;
  diff: Record<string, string>;
  intent_hash?: string;
}

interface Props {
  event: TransactionLog;
  data: TokenDiffEvent[] | TokenDiffEvent;
}

const Transfer = ({ event, data }: Props) => {
  const router = useRouter();
  const { hash } = router.query;

  const normalizedData: TokenDiffEvent[] = Array.isArray(data)
    ? data
    : data
    ? [data as TokenDiffEvent]
    : [];

  if (normalizedData.length === 0) return null;

  const userSwaps = normalizedData.reduce(
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

  const Loader = ({
    className = '',
    wrapperClassName = '',
  }: {
    className?: string;
    wrapperClassName?: string;
  }) => (
    <div
      className={`bg-gray-200 dark:bg-black-200 h-5 w-full max-w-xs rounded shadow-sm animate-pulse ${className} ${wrapperClassName}`}
    ></div>
  );

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
          <Link
            href={`/address/${account}`}
            className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap font-normal pl-1"
          >
            {shortenText(account)}
          </Link>
          <span className="font-semibold text-gray pl-1 pr-0.5"> Swap </span>

          {sent?.length > 0 ? (
            sent?.map(({ token, amount }, index) => (
              <TokenInfo
                key={`sent-${token}-${index}`}
                contract={token?.split(':')[1] || token}
                amount={amount}
                isShowText
              />
            ))
          ) : (
            <Loader wrapperClassName="flex w-full max-w-xs" />
          )}

          <span className="font-bold text-gray px-0.5 text-sm whitespace-nowrap">
            For
          </span>

          {received?.length > 0 ? (
            received?.map(({ token, amount }, index) => (
              <TokenInfo
                key={`received-${token}-${index}`}
                contract={token?.split(':')[1] || token}
                amount={amount}
                isShowText
              />
            ))
          ) : (
            <Loader wrapperClassName="flex w-full max-w-xs" />
          )}

          <span className="font-bold text-gray pl-1 text-sm sm:text-base flex items-center">
            On{' '}
            <Link
              href="/address/intents.near"
              className="text-green-500 dark:text-green-250 font-normal hover:no-underline flex items-center pl-1"
            >
              <IntentsIcon className="h-4 w-4 mr-1" />
              intents.near
            </Link>
          </span>
        </div>
      ))}
    </div>
  );
};

export default Transfer;
