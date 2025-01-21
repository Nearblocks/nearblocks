import React, { useState, useEffect } from 'react';
import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { TransactionLog } from '@/utils/types';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getNetworkDetails } from '@/utils/near';
import { chainAbstractionExplorerUrl } from '@/utils/config';
import { shortenText } from '@/utils/libs';
import IntentsIcon from '@/components/Icons/IntentsIcon';
import { useNetworkIcons } from '@/hooks/useNetworkIcons';

interface DataItem {
  owner_id: string;
  token_ids: string[];
  amounts: string[];
}

interface Props {
  event: TransactionLog;
  data: DataItem[];
  actionsLog: any;
}

interface SignedIntent {
  intent: string;
  token: string;
  receiver_id: string;
  amount: string;
  memo?: string;
}

const Burn = ({ event, data, actionsLog }: Props) => {
  const router = useRouter();
  const { hash } = router?.query;
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
              <span className="font-semibold text-gray pl-1">Withdraw</span>
              <TokenInfo
                contract={token_ids[0]?.split(':')[1]}
                amount={amounts[0]}
                isShowText={true}
              />
              {address && Object.keys(address)?.length > 0 && (
                <div className="flex items-center">
                  <span className="font-bold text-gray text-sm sm:text-xs pl-1">
                    To
                  </span>
                  <Link
                    href={`${address?.externalLink}`}
                    className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap font-normal pl-1"
                  >
                    {networkIcon}
                    <span className="pl-1">
                      {shortenText(address?.address)}
                    </span>
                  </Link>
                </div>
              )}
              {!address && (
                <div className="flex items-center">
                  <span className="font-bold text-gray text-sm sm:text-xs pl-1">
                    To
                  </span>
                  <Link
                    href={`/address/${item?.owner_id}`}
                    className="inline-flex items-center text-green-500 dark:text-green-250 whitespace-nowrap font-normal pl-"
                  >
                    {networkIcon}
                    <span className="pl-1">{shortenText(item?.owner_id)}</span>
                  </Link>
                </div>
              )}
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
