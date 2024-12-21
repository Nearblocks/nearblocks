import React from 'react';
import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { TransactionLog } from '@/utils/types';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface DataItem {
  owner_id: string;
  token_ids: string[];
  amounts: string[];
}

interface Props {
  event: TransactionLog;
  data: DataItem[];
}

const Mint = ({ event, data }: Props) => {
  const router = useRouter();
  const { hash } = router.query;

  return (
    <div className="action flex flex-col space-y-3 break-all leading-7">
      {data.map((item) => {
        const { token_ids, amounts } = item;

        if (token_ids && amounts && token_ids.length === amounts.length) {
          return token_ids.map((token, idx) => (
            <div
              key={idx}
              className={`flex flex-wrap items-start gap-2 sm:!gap-1 ${
                idx < token_ids.length - 1 ? 'mb-2 sm:mb-1' : ''
              }`}
            >
              {event?.receiptId && hash ? (
                <Link href={`/txns/${hash}#execution#${event.receiptId}`}>
                  <FaRight className="inline-flex text-gray-400 text-xs sm:text-[10px] cursor-pointer mt-1 sm:mt-0" />
                </Link>
              ) : (
                <FaRight className="inline-flex text-gray-400 text-xs sm:text-[10px]" />
              )}
              <span className="font-bold text-sm sm:text-xs pt-1">Deposit</span>
              <div className="inline-flex">
                <TokenInfo
                  contract={token.split(':')[1]}
                  amount={amounts[idx]}
                  isShowText={true}
                />
              </div>
              <span className="font-bold text-gray px-1 text-sm sm:text-xs pt-0 sm:pt-1">
                On{' '}
                <Link
                  href="/address/intents.near"
                  className="text-green-500 dark:text-green-250 font-normal hover:no-underline"
                >
                  intents.near
                </Link>
              </span>
            </div>
          ));
        }
        return null;
      })}
    </div>
  );
};

export default Mint;
