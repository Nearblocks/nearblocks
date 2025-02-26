import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { TransactionLog } from '@/utils/types';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { shortenText } from '@/utils/libs';
import IntentsIcon from '@/components/Icons/IntentsIcon';

interface DataItem {
  owner_id: string;
  token_ids: string[];
  amounts: string[];
}

interface Props {
  event: TransactionLog;
  data: DataItem[];
}

const Burn = ({ event, data }: Props) => {
  const router = useRouter();
  const { hash } = router?.query;

  return (
    <div className="action flex flex-col break-all">
      {data?.map((item) => {
        const { token_ids, amounts } = item;

        if (token_ids && amounts && token_ids?.length > 0) {
          return (
            <div key={0} className="flex flex-wrap items-center justify-start">
              {event?.receiptId && hash ? (
                <Link href={`/txns/${hash}#execution#${event?.receiptId}`}>
                  <FaRight className="text-gray-400 cursor-pointer text-xs" />
                </Link>
              ) : (
                <FaRight className="text-gray-400 text-xs" />
              )}
              <div className="flex items-center">
                <Link
                  href={`/address/${item?.owner_id}`}
                  className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap font-normal pl-"
                >
                  <span className="pl-1">{shortenText(item?.owner_id)}</span>
                </Link>
              </div>

              <span className="font-semibold text-gray pl-1 pr-0.5">
                Withdraw
              </span>
              <TokenInfo
                contract={token_ids[0]?.split(':')[1]}
                amount={amounts[0]}
                isShowText={true}
              />
              <div className="flex items-center pl-1">
                <span className="font-bold text-gray text-sm sm:text-xs">
                  From
                </span>
                <Link
                  href="/address/intents.near"
                  className="inline-flex items-center text-green-500 dark:text-green-250 font-normal pl-1 hover:no-underline"
                >
                  <IntentsIcon className="h-4 w-4 mr-1" /> intents.near
                </Link>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default Burn;
