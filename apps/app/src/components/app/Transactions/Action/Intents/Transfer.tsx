import React from 'react';
import { TransactionLog } from '@/utils/types';
import Link from 'next/link';
import FaRight from '@/components/app/Icons/FaRight';
import TokenInfo from '@/components/app/common/TokenInfo';
import IntentsIcon from '@/components/app/Icons/IntentsIcon';
import { useParams } from 'next/navigation';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

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
  const params = useParams<{ hash: string }>();
  const hash = params?.hash;

  const reversedData = [...data];

  const selectedData =
    reversedData?.length >= 2
      ? [reversedData[0], reversedData[reversedData?.length - 1]]
      : reversedData;

  const tokens = selectedData?.flatMap(
    (item) =>
      item?.token_ids?.map((token, idx) => ({
        token,
        amount: item?.amounts[idx],
      })),
  );

  const signer = data[0]?.old_owner_id;

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
    <div className="action flex flex-col break-all">
      <div className="flex flex-wrap items-center justify-start">
        {event?.receiptId && hash ? (
          <Link href={`/txns/${hash}#execution#${event?.receiptId}`}>
            <FaRight className="text-gray-400 text-xs cursor-pointer" />
          </Link>
        ) : (
          <FaRight className="text-gray-400 text-xs" />
        )}
        {signer && (
          <AddressOrTxnsLink
            className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap font-normal pl-1 h-6"
            currentAddress={signer}
          />
        )}
        <span className="font-semibold text-gray pl-0.5"> swapped </span>
        {!tokens || tokens?.length === 0 ? (
          <Loader wrapperClassName="flex w-full max-w-xs" />
        ) : (
          tokens?.map(({ token, amount }, index) => {
            const contractName = token?.includes(':')
              ? token?.split(':')[1]
              : token;
            const isLastToken = index === tokens?.length - 1;

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
                    <span className="font-bold text-gray pl-1 text-sm whitespace-nowrap">
                      For
                    </span>
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
        <span className="font-bold text-gray pl-1 text-sm sm:text-base flex items-center">
          On <IntentsIcon className="h-4 w-4 ml-1" />
          <AddressOrTxnsLink
            className="text-green-500 dark:text-green-250 font-normal hover:no-underline flex items-center ml-0.5 h-6"
            currentAddress={'intents.near'}
          />
        </span>
      </div>
    </div>
  );
};

export default Transfer;
