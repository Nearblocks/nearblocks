import React, { useState, useEffect } from 'react';
import TokenInfo from '@/components/common/TokenInfo';
import FaRight from '@/components/Icons/FaRight';
import { TransactionLog } from '@/utils/types';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getNetworkDetails } from '@/utils/near';
import { chainAbstractionExplorerUrl } from '@/utils/config';
import { shortenText } from '@/utils/libs';
import Bitcoin from '@/components/Icons/Networks/Bitcoin';
import Ethereum from '@/components/Icons/Networks/Ethereum';
import Solana from '@/components/Icons/Networks/Solana';
import IntentsIcon from '@/components/Icons/IntentsIcon';
import Arbitrum from '@/components/Icons/Networks/Arbitrum';
import Doge from '@/components/Icons/Networks/Doge';
import XRP from '@/components/Icons/Networks/XRP';
import Base from '@/components/Icons/Networks/Base';

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
            const networkType = getNetworkDetails(externalAddress);

            const url =
              networkType in chainAbstractionExplorerUrl
                ? chainAbstractionExplorerUrl[
                    networkType as keyof typeof chainAbstractionExplorerUrl
                  ]?.address(extractedAddress)
                : '';

            setAddress({
              network: networkType,
              externalLink: url,
              address: extractedAddress,
            });
          }
        }
      }
    }
  }, [actionsLog]);

  return (
    <div className="flex flex-col break-all leading-7">
      {data.map((item) => {
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
                    {address?.network === 'bitcoin' && (
                      <Bitcoin className="w-4 h-4 text-orange-400" />
                    )}
                    {address?.network === 'ethereum' && (
                      <Ethereum className="w-4 h-4 text-black-200 dark:text-neargray-10" />
                    )}
                    {address?.network === 'solana' && (
                      <Solana className="w-3 h-4" />
                    )}
                    {address?.network === 'arbitrum' && (
                      <Arbitrum className="w-4 h-4" />
                    )}
                    {address?.network === 'doge' && (
                      <Doge className="w-4 h-4" />
                    )}
                    {address?.network === 'xrp' && <XRP className="w-4 h-4" />}
                    {address?.network === 'base' && (
                      <Base className="w-4 h-4 dark:!invert" />
                    )}
                    <span className="pl-1">
                      {shortenText(address?.address)}
                    </span>
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
