import React from 'react';
import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { TransactionLog } from '@/utils/types';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface DataItem {
  old_owner_id: string;
  new_owner_id: string;
  token_ids: string[];
  amounts: string[];
}

interface Props {
  event: TransactionLog;
  data: DataItem[];
}

const Transfer = ({ event, data }: Props) => {
  const router = useRouter();
  const { hash } = router.query;

  // Handle cases with insufficient data
  const reversedData = [...data].reverse();
  console.log({ data });
  const selectedData =
    reversedData.length >= 2
      ? [reversedData[0], reversedData[reversedData.length - 1]]
      : reversedData;

  const tokens = selectedData.flatMap((item) =>
    item.token_ids.map((token, idx) => ({
      token,
      amount: item.amounts[idx],
    })),
  );

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
    <div className="action flex flex-col space-y-3 break-all leading-7">
      <div className="flex flex-wrap items-center gap-1 sm:gap-1 text-sm sm:text-base mt-1">
        {event?.receiptId && hash ? (
          <Link href={`/txns/${hash}#execution#${event.receiptId}`}>
            <FaRight className="inline-flex text-gray-400 text-xs cursor-pointer" />
          </Link>
        ) : (
          <FaRight className="inline-flex text-gray-400 text-xs" />
        )}
        <span className="font-bold">Swap</span>
        {!tokens || tokens.length === 0 ? (
          <Loader wrapperClassName="flex w-full max-w-xs" />
        ) : (
          tokens.map(({ token, amount }, index) => {
            const contractName = token.includes(':')
              ? token.split(':')[1]
              : token;
            const isLastToken = index === tokens.length - 1;

            return (
              <>
                {!isLastToken && (
                  <TokenInfo
                    contract={contractName}
                    amount={amount}
                    isShowText={true}
                  />
                )}
                {isLastToken && (
                  <>
                    <span className="font-bold text-gray pl-1">For</span>
                    <TokenInfo
                      contract={contractName}
                      amount={amount}
                      isShowText={true}
                    />
                  </>
                )}
              </>
            );
          })
        )}
        <span className="font-bold text-gray pl-1">
          On{' '}
          <Link
            href="/address/intents.near"
            className="text-green-500 dark:text-green-250 font-normal hover:no-underline"
          >
            intents.near
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Transfer;
