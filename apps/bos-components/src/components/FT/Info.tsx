/**
 * Component: FTInfo
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Information About Fungible Token On Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [id] - The token identifier passed as a string
 * @param {Token} [token] - The Token type passed as object
 * @param {string} ownerId - The identifier of the owner of the component.
 */
interface Props {
  ownerId: string;
  network: string;
  id: string;
  token?: Token;
}

import CoinMarketcap from '@/includes/icons/CoinMarketcap';
import CoinGecko from '@/includes/icons/CoinGecko';
import { Token } from '@/includes/types';

export default function ({ token, id, network, ownerId }: Props) {
  const { localFormat, dollarNonCentFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [tokens, setTokens] = useState<Token>({} as Token);

  const config = getConfig && getConfig(network);

  useEffect(() => {
    function fetchFTData() {
      asyncFetch(`${config.backendUrl}fts/${id}`)
        .then(
          (data: {
            body: {
              contracts: Token[];
            };
            status: number;
          }) => {
            const resp = data?.body?.contracts?.[0];
            if (data.status === 200) {
              setTokens(resp);
            } else {
              handleRateLimit(data, fetchFTData);
            }
          },
        )
        .catch(() => {});
    }

    if (!token && token === undefined) {
      fetchFTData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, id, token]);

  useEffect(() => {
    if (token) {
      setTokens(token);
    }
  }, [token]);

  return (
    <div className="px-3 pt-2 pb-5 text-sm text-gray">
      {tokens?.description && (
        <>
          <h3 className="text-nearblue-600  dark:text-neargray-10 text-sm font-semibold py-2 underline">
            Overview
          </h3>
          <p className="text-sm py-2 text-nearblue-600 dark:text-neargray-10">
            {tokens?.description}
          </p>
        </>
      )}
      <h3 className="text-nearblue-600  dark:text-neargray-10 text-sm font-semibold py-2 underline">
        Market
      </h3>
      <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
        <div className="w-full md:w-1/4 mb-2 md:mb-0">Volume (24H):</div>
        <div className="w-full md:w-3/4 break-words">
          {tokens?.volume_24h !== null && tokens?.volume_24h !== undefined ? (
            `$${dollarNonCentFormat(tokens?.volume_24h)}`
          ) : (
            <span className="text-xs">N/A</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
        <div className="w-full md:w-1/4 mb-2 md:mb-0">Circulating MC:</div>
        <div className="w-full md:w-3/4 break-words">
          {tokens?.market_cap !== null && tokens?.market_cap !== undefined ? (
            `$${dollarNonCentFormat(tokens?.market_cap)}`
          ) : (
            <span className="text-xs">N/A</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
        <div className="w-full md:w-1/4 mb-2 md:mb-0">On-chain MC:</div>
        <div className="w-full md:w-3/4 break-words">
          {tokens?.onchain_market_cap !== null &&
          tokens?.onchain_market_cap !== undefined ? (
            `$${dollarNonCentFormat(tokens?.onchain_market_cap)}`
          ) : (
            <span className="text-xs">N/A</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap lg:w-1/2 py-2 text-nearblue-600 dark:text-neargray-10">
        <div className="w-full md:w-1/4 mb-2 md:mb-0">Circulating Supply:</div>
        <div className="w-full md:w-3/4 break-words">
          {tokens?.circulating_supply !== null &&
          tokens?.circulating_supply !== undefined ? (
            `${localFormat(tokens?.circulating_supply)}`
          ) : (
            <span className="text-xs">N/A</span>
          )}
        </div>
      </div>
      <div className="flex flex-wrap lg:w-1/2 pt-6 text-gray-400 dark:text-neargray-10 text-xs">
        <div className="w-full md:w-1/4 mb-2 md:mb-0">Market Data Source:</div>
        <div className="w-full md:w-3/4 break-words flex">
          {tokens?.coingecko_id && (
            <a
              className="text-green-500 dark:text-green-250 mr-4 flex"
              href="https://www.coingecko.com/"
              target="_blank"
              rel="noreferrer nofollow noopener"
            >
              <CoinGecko className="h-4 w-4 fill-current mr-1" />
              CoinGecko
            </a>
          )}
          {tokens?.coinmarketcap_id && (
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
        </div>
      </div>
    </div>
  );
}
