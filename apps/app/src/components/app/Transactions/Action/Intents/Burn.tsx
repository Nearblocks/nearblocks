import React, { useState, useEffect } from 'react';
import { TransactionLog } from '@/utils/types';
import Link from 'next/link';
import { getNetworkDetails } from '@/utils/near';
import TokenInfo from '@/components/app/common/TokenInfo';
import FaRight from '@/components/app/Icons/FaRight';
import { shortenText } from '@/utils/libs';
import { chainAbstractionExplorerUrl } from '@/utils/app/config';
import IntentsIcon from '@/components/app/Icons/IntentsIcon';
import { useNetworkIcons } from '@/hooks/app/useNetworkIcons';
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
  actionsLog: any;
  meta: any;
}

interface SignedIntent {
  intent: string;
  token: string;
  receiver_id: string;
  amount: string;
  memo?: string;
}

const Burn = ({ event, data, actionsLog, meta }: Props) => {
  const params = useParams<{ hash: string }>();
  const hash = params?.hash;
  const [address, setAddress] = useState<any>();
  const [networkType, setNetworkType] = useState<any>();
  const networkIcon = useNetworkIcons({ network: networkType });

  useEffect(() => {
    const args = actionsLog[0]?.args?.args;
    let parsedArgs;

    try {
      parsedArgs = typeof args === 'string' ? JSON?.parse(args) : args;
    } catch (error) {
      console.log('Error parsing args:', error);
      parsedArgs = null;
    }

    if (parsedArgs?.signed) {
      const filteredActions = parsedArgs?.signed?.flatMap((action: any) => {
        const intents =
          action?.payload?.message?.intents || action?.payload?.intents;
        return (
          intents?.filter(
            (intent: SignedIntent) =>
              intent?.intent === 'ft_withdraw' && Boolean(intent?.memo),
          ) || []
        );
      });

      if (filteredActions && filteredActions?.length > 0) {
        const memo = filteredActions[0]?.memo;
        const externalAddress = filteredActions[0]?.token;
        if (memo) {
          const addressMatch = memo.match(/WITHDRAW_TO:([a-zA-Z0-9]+)/);
          const extractedAddress = addressMatch ? addressMatch[1] : null;
          if (extractedAddress) {
            const networkId = getNetworkDetails(externalAddress);
            setNetworkType(networkId);
            const url =
              networkId && networkId in chainAbstractionExplorerUrl
                ? chainAbstractionExplorerUrl[
                    networkId as keyof typeof chainAbstractionExplorerUrl
                  ]?.address(extractedAddress)
                : '';
            setAddress({
              network: networkId,
              externalLink: url,
              address: extractedAddress,
            });
          }
        }
      }
    }
  }, [actionsLog]);

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
              {!address && (
                <div className="flex items-center">
                  <AddressOrTxnsLink
                    className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap font-normal pl-0.5 h-6"
                    currentAddress={item?.owner_id}
                  />
                </div>
              )}
              <span className="font-semibold text-gray pl-1">Withdraw</span>
              <TokenInfo
                contract={token_ids[0]?.split(':')[1]}
                amount={amounts[0]}
                isShowText={true}
                metaInfo={metaInfo}
              />
              {address && Object.keys(address)?.length > 0 && (
                <div className="flex items-center">
                  <span className="font-bold text-gray text-sm sm:text-xs pl-1 mr-1">
                    To
                  </span>
                  {networkIcon}
                  <AddressOrTxnsLink
                    href={address?.externalLink}
                    className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap font-normal pl-1 h-6"
                    name={shortenText(address?.address)}
                  />
                </div>
              )}

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
