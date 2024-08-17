import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';
import Skeleton from '@/components/skeleton/common/Skeleton';
import {
  convertToUTC,
  dollarFormat,
  dollarNonCentFormat,
  localFormat,
  nanoToMilli,
  shortenAddress,
} from '@/utils/libs';
import { tokenAmount } from '@/utils/near';
import {
  AccountInfo,
  DeploymentsInfo,
  HoldersPropsInfo,
  Token,
} from '@/utils/types';
import Link from 'next/link';

interface Props {
  id: string;
  token?: Token;
  account: AccountInfo;
  contract: DeploymentsInfo;
  transfers: number;
  holdersData: HoldersPropsInfo[];
  holdersCount: number;
  tab: string;
}

const FAQ = ({
  id,
  token,
  account,
  contract,
  transfers,
  holdersData,
  holdersCount,
  tab,
}: Props) => {
  const name = token?.name;
  const tokenTicker = token?.symbol;
  const largestHolder: HoldersPropsInfo = holdersData?.[0];
  const holders = holdersCount;

  return (
    <>
      {tab === 'faq' ? (
        <div itemScope itemType="http://schema.org/FAQPage">
          {!token ? (
            <div>
              <div className="px-3 pb-2 text-sm divide-y divide-gray-200 dark:divide-black-200 space-y-2">
                <div>
                  <h3 className="text-nearblue-600 dark:text-neargray-10 text-sm font-semibold pt-4 pb-2">
                    <Skeleton className="w-40 h-4" />
                  </h3>
                  <div>
                    <div className="text-sm text-nearblue-600 dark:text-neargray-10 py-2">
                      <Skeleton className="w-full h-8" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-nearblue-600 dark:text-neargray-10 text-sm font-semibold pt-4 pb-2">
                    <Skeleton className="w-40 h-4" />
                  </h3>
                  <div>
                    <div className="text-sm text-nearblue-600 dark:text-neargray-10 py-2">
                      <Skeleton className="w-full h-8" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-nearblue-600 dark:text-neargray-10 text-sm font-semibold pt-4 pb-2">
                    <Skeleton className="w-40 h-4" />
                  </h3>
                  <div>
                    <div className="text-sm text-nearblue-600 dark:text-neargray-10 py-2">
                      <Skeleton className="w-full h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : token && Object.keys(token).length > 0 ? (
            <div className="px-3 pb-2 text-sm divide-y divide-gray-200 dark:divide-black-200 space-y-2">
              <div
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <h3
                  className="text-nearblue-600 dark:text-neargray-10 text-sm font-semibold pt-4 pb-2"
                  itemProp="name"
                >
                  What is {name} price now?
                </h3>
                <div
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <div
                    itemProp="text"
                    className="text-sm text-nearblue-600 dark:text-neargray-10 py-2"
                  >
                    The live price of {name} is{' '}
                    {token?.price !== null && token?.price !== undefined ? (
                      `$${dollarFormat(token?.price)} (${tokenTicker} / USD)`
                    ) : (
                      <span className="text-xs">N/A</span>
                    )}{' '}
                    today with a current circulating market cap of{' '}
                    {token?.market_cap !== null &&
                    token?.market_cap !== undefined ? (
                      `$${dollarNonCentFormat(token?.market_cap)}`
                    ) : (
                      <span className="text-xs">N/A</span>
                    )}
                    . The on-chain marketcap of {name} is{' '}
                    {token?.onchain_market_cap !== null &&
                    token?.onchain_market_cap !== undefined ? (
                      `$${dollarNonCentFormat(token?.onchain_market_cap)}`
                    ) : (
                      <span className="text-xs">N/A</span>
                    )}
                    . {name}&apos;s 24-hour trading volume is{' '}
                    {token?.volume_24h !== null &&
                    token?.volume_24h !== undefined ? (
                      `$${dollarNonCentFormat(token?.volume_24h)}`
                    ) : (
                      <span className="text-xs">N/A</span>
                    )}
                    . {tokenTicker} to USD price is updated in real-time. {name}{' '}
                    is{' '}
                    {token?.change_24 !== null &&
                    token?.change_24 !== undefined ? (
                      Number(token?.change_24) > 0 ? (
                        dollarFormat(token?.change_24) + '%'
                      ) : (
                        dollarFormat(token?.change_24) + '%'
                      )
                    ) : (
                      <span>N/A</span>
                    )}{' '}
                    in the last 24 hours.
                  </div>
                </div>
              </div>
              <div
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <h3
                  className="text-nearblue-600 dark:text-neargray-10 text-sm font-semibold pt-4 pb-2"
                  itemProp="name"
                >
                  When was {name} created on Near Protocol?
                </h3>
                <div
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <div
                    className="text-sm text-nearblue-600 dark:text-neargray-10 py-2"
                    itemProp="text"
                  >
                    The{' '}
                    <Link href={`/address/${id}`} className="underline">
                      {name}
                    </Link>{' '}
                    contract was created on Near Protocol at{' '}
                    {account?.created?.transaction_hash
                      ? convertToUTC(
                          nanoToMilli(account?.created.block_timestamp),
                          false,
                        )
                      : account?.code_hash
                      ? 'Genesis'
                      : 'N/A'}{' '}
                    by{' '}
                    {contract?.receipt_predecessor_account_id && (
                      <Link
                        href={`/address/${contract.receipt_predecessor_account_id}`}
                        className="underline"
                      >
                        {shortenAddress(
                          contract.receipt_predecessor_account_id,
                        )}
                      </Link>
                    )}{' '}
                    through this{' '}
                    {contract?.transaction_hash && (
                      <Link
                        href={`/txns/${contract.transaction_hash}`}
                        className="underline"
                      >
                        transaction
                      </Link>
                    )}
                    . Since the creation of {name}, there has been{' '}
                    {transfers ? localFormat(transfers.toString()) : 0} on-chain
                    transfers.
                  </div>
                </div>
              </div>
              <div
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <h3
                  className="text-nearblue-600 dark:text-neargray-10 text-sm font-semibold pt-4 pb-2"
                  itemProp="name"
                >
                  How many {name} tokens are there?
                </h3>
                <div
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <div
                    className="text-sm text-nearblue-600 dark:text-neargray-10 py-2"
                    itemProp="text"
                  >
                    There are currently{' '}
                    {token?.circulating_supply !== null ? (
                      `${
                        token?.circulating_supply
                          ? localFormat(token?.circulating_supply)
                          : 0
                      }`
                    ) : (
                      <span>N/A</span>
                    )}{' '}
                    {tokenTicker} in circulation for a total supply of{' '}
                    {token?.total_supply !== null &&
                      token?.total_supply !== undefined &&
                      `${dollarNonCentFormat(token?.total_supply)} `}
                    {tokenTicker}. {tokenTicker}&apos;s supply is split between{' '}
                    {holders ? localFormat(holders.toString()) : 0} different
                    wallet addresses.{' '}
                    {largestHolder?.account && (
                      <span>
                        The largest {tokenTicker} holder is currently{' '}
                        {largestHolder?.account && (
                          <Link
                            href={`/address/${largestHolder.account}`}
                            className="underline"
                          >
                            {shortenAddress(largestHolder.account)}
                          </Link>
                        )}
                        , who currently holds{' '}
                        {localFormat(
                          tokenAmount(
                            largestHolder?.amount,
                            token?.decimals,
                            true,
                          ),
                        )}{' '}
                        {tokenTicker} of all {tokenTicker}.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-6 py-4 dark:text-gray-400 text-nearblue-700 text-xs">
              <ErrorMessage
                icons={<FaInbox />}
                message="There are no matching entries"
                mutedText="Please try again later"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-[500px]"></div>
      )}
    </>
  );
};
export default FAQ;
