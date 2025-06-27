import { TransactionLog } from '@/utils/types';
import Link from 'next/link';
import TokenInfo from '@/components/app/common/TokenInfo';
import FaRight from '@/components/app/Icons/FaRight';
import IntentsIcon from '@/components/app/Icons/IntentsIcon';
import { useParams } from 'next/navigation';
import { AddressOrTxnsLink } from '@/components/app/common/HoverContextProvider';

interface DataItem {
  owner_id: string;
  token_ids: string[];
  amounts: string[];
}

interface Props {
  event: TransactionLog;
  data: DataItem[];
  meta: any;
}

const Burn = ({ event, data, meta }: Props) => {
  const params = useParams<{ hash: string }>();
  const hash = params?.hash;

  return (
    <div className="action flex flex-col break-all">
      {data?.map((item) => {
        const { token_ids, amounts } = item;
        const metaInfo = meta?.filter(
          (meta: any) => meta.contractId === token_ids[0]?.split(':')[1],
        );
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
                <AddressOrTxnsLink
                  className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap font-normal pl-0.5 h-6"
                  currentAddress={item?.owner_id}
                />
              </div>
              <span className="font-semibold text-gray pl-1">Withdraw</span>
              <TokenInfo
                contract={token_ids[0]?.split(':')[1]}
                amount={amounts[0]}
                isShowText={true}
                metaInfo={metaInfo}
              />

              <div className="flex items-center pl-0.5">
                <span className="font-bold text-gray text-sm sm:text-xs mr-1">
                  From
                </span>
                <IntentsIcon className="h-4 w-4 ml-0.5" />
                <AddressOrTxnsLink
                  className="text-green-500 dark:text-green-250 font-normal hover:no-underline flex items-center ml-0.5 h-6"
                  currentAddress={'intents.near'}
                />
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
