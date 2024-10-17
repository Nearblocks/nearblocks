import { dollarNonCentFormat, localFormat } from '@/utils/libs';
import { Token } from '@/utils/types';
import Skeleton from '@/components/skeleton/common/Skeleton';
import CoinGecko from '@/components/Icons/CoinGecko';
import CoinMarketcap from '@/components/Icons/CoinMarketcap';

interface Props {
  token?: Token;
  error: boolean;
  tab: string;
}

const Info = ({ token, tab }: Props) => {
  return (
    <>
      {tab === 'info' ? (
        <div className="px-3 pt-2 pb-5 text-sm text-gray">
          {token ? (
            <>
              {token?.description && (
                <>
                  <h3 className="text-nearblue-600  dark:text-neargray-10 text-sm font-semibold py-2 underline">
                    Overview
                  </h3>
                  <p className="text-sm py-2 text-nearblue-600 dark:text-neargray-10">
                    {token?.description}
                  </p>
                </>
              )}
            </>
          ) : (
            <>
              <h3 className="text-nearblue-600  dark:text-neargray-10 text-sm font-semibold py-2 underline">
                Overview
              </h3>
              <div className="text-sm py-2 text-nearblue-600 dark:text-neargray-10">
                <Skeleton className="w-1/3 h-4" />
              </div>
            </>
          )}
          <h3 className="text-nearblue-600  dark:text-neargray-10 text-sm font-semibold py-2 underline">
            Market
          </h3>
          <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">Volume (24H):</div>
            <div className="w-full md:w-3/4 break-words">
              {token ? (
                token?.volume_24h !== null &&
                token?.volume_24h !== undefined ? (
                  `$${dollarNonCentFormat(token?.volume_24h)}`
                ) : (
                  <span className="text-xs">N/A</span>
                )
              ) : (
                <Skeleton className="w-full h-4" />
              )}
            </div>
          </div>
          <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">Circulating MC:</div>
            <div className="w-full md:w-3/4 break-words">
              {token ? (
                token?.market_cap !== null &&
                token?.market_cap !== undefined ? (
                  `$${dollarNonCentFormat(token?.market_cap)}`
                ) : (
                  <span className="text-xs">N/A</span>
                )
              ) : (
                <Skeleton className="w-full h-4" />
              )}
            </div>
          </div>
          <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">On-chain MC:</div>
            <div className="w-full md:w-3/4 break-words">
              {token ? (
                token?.onchain_market_cap !== null &&
                token?.onchain_market_cap !== undefined ? (
                  `$${dollarNonCentFormat(token?.onchain_market_cap)}`
                ) : (
                  <span className="text-xs">N/A</span>
                )
              ) : (
                <Skeleton className="w-full h-4" />
              )}
            </div>
          </div>
          <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              Circulating Supply:
            </div>
            <div className="w-full md:w-3/4 break-words">
              {token ? (
                token?.circulating_supply !== null &&
                token?.circulating_supply !== undefined ? (
                  `${localFormat(token?.circulating_supply)}`
                ) : (
                  <span className="text-xs">N/A</span>
                )
              ) : (
                <Skeleton className="w-full h-4" />
              )}
            </div>
          </div>
          <div className="flex flex-wrap lg:w-1/2 pt-6 text-gray-400 dark:text-neargray-10 text-xs">
            <div className="w-full md:w-1/4 mb-2 md:mb-0">
              Market Data Source:
            </div>
            <div className="w-full md:w-3/4 break-words flex">
              {token ? (
                <>
                  {token?.coingecko_id && (
                    <a
                      className="text-green-500 dark:text-green-250 mr-4 flex"
                      href="https://www.coingecko.com?utm_campaign=partnership&utm_source=nearblocks&utm_medium=referral"
                      target="_blank"
                      rel="noreferrer nofollow noopener"
                    >
                      <CoinGecko className="h-4 w-4 fill-current mr-1" />
                      CoinGecko
                    </a>
                  )}{' '}
                  {token?.coinmarketcap_id && (
                    <a
                      className="text-green-500 dark:text-green-250 mr-4 flex"
                      href="https://coinmarketcap.com/"
                      target="_blank"
                      rel="noreferrer nofollow noopener"
                    >
                      <CoinMarketcap className="h-4 w-4 fill-current mr-1" />
                      Coinmarketcap
                    </a>
                  )}
                </>
              ) : (
                <Skeleton className="w-full h-4" />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[500px]"></div>
      )}
    </>
  );
};
export default Info;
