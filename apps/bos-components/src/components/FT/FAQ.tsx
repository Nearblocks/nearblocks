/**
 * Component: FTFAQ
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: FAQ About Fungible Token On Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [id] - The token identifier passed as a string
 * @param {Token} [token] - The Token type passed as object
 */

interface Props {
  network: string;
  id: string;
  token?: Token;
}

import {
  localFormat,
  dollarFormat,
  dollarNonCentFormat,
  convertToUTC,
} from '@/includes/formats';
import { getConfig, nanoToMilli, shortenAddress } from '@/includes/libs';
import { tokenAmount } from '@/includes/near';
import {
  AccountInfo,
  DeploymentsInfo,
  HoldersPropsInfo,
  Token,
} from '@/includes/types';

export default function ({ network, id, token }: Props) {
  const [account, setAccount] = useState<AccountInfo>({} as AccountInfo);
  const [contract, setContract] = useState<DeploymentsInfo>(
    {} as DeploymentsInfo,
  );
  const [transfers, setTransfers] = useState(0);
  const [holders, setHolders] = useState(0);
  const [largestHolder, setLargestHolder] = useState<HoldersPropsInfo>(
    {} as HoldersPropsInfo,
  );
  const [tokens, setTokens] = useState<Token>({} as Token);

  const name = tokens?.name;
  const tokenTicker = tokens?.symbol;
  const config = getConfig(network);
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
            }
          },
        )
        .catch(() => {});
    }
    function fetchAccountData() {
      asyncFetch(`${config?.backendUrl}account/${id}`)
        .then(
          (data: {
            body: {
              account: AccountInfo[];
            };
            status: number;
          }) => {
            const accountResp = data?.body?.account?.[0];
            if (data.status === 200) {
              setAccount(accountResp);
            }
          },
        )
        .catch(() => {});
    }
    function fetchContractData() {
      asyncFetch(`${config?.backendUrl}account/${id}/contract/deployments`)
        .then(
          (data: {
            body: {
              deployments: DeploymentsInfo[];
            };
            status: number;
          }) => {
            const depResp = data?.body?.deployments?.[0];
            if (data.status === 200) {
              setContract(depResp);
            }
          },
        )
        .catch(() => {});
    }
    function fetchTotalTxns() {
      asyncFetch(`${config?.backendUrl}fts/${id}/txns/count`)
        .then(
          (data: {
            body: {
              txns: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns?.[0];
            if (data.status === 200) {
              setTransfers(resp?.count);
            }
          },
        )
        .catch(() => {});
    }
    function fetchHoldersdata() {
      asyncFetch(`${config?.backendUrl}fts/${id}/holders`)
        .then(
          (data: {
            body: {
              holders: HoldersPropsInfo[];
            };
            status: number;
          }) => {
            const resp = data?.body?.holders?.[0];
            if (data.status === 200) {
              setLargestHolder(resp);
            }
          },
        )
        .catch(() => {});
    }
    function fetchHoldersCount() {
      asyncFetch(`${config?.backendUrl}fts/${id}/holders/count`)
        .then(
          (data: {
            body: {
              holders: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.holders?.[0];
            if (data.status === 200) {
              setHolders(resp?.count);
            }
          },
        )
        .catch(() => {});
    }
    if (!token && token === undefined) {
      fetchFTData();
    }
    fetchAccountData();
    fetchContractData();
    fetchHoldersCount();
    fetchTotalTxns();
    fetchHoldersdata();
  }, [id, config?.backendUrl, token]);
  useEffect(() => {
    if (token) {
      setTokens(token);
    }
  }, [token]);
  return (
    <div itemScope itemType="http://schema.org/FAQPage">
      <div className="px-3 pb-2 text-sm divide-y divide-gray-200 space-y-2">
        <div
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/Question"
        >
          <h3
            className="text-gray-600 text-sm font-semibold pt-4 pb-2"
            itemProp="name"
          >
            What is {name} price now?
          </h3>
          <div
            itemScope
            itemProp="acceptedAnswer"
            itemType="https://schema.org/Answer"
          >
            <div itemProp="text" className="text-sm text-gray-600 py-2">
              The live price of {name} is{' '}
              {tokens?.price !== null && tokens?.price !== undefined ? (
                `$${dollarFormat(tokens?.price)} (${tokenTicker} / USD)`
              ) : (
                <span className="text-xs">N/A</span>
              )}{' '}
              today with a current circulating market cap of{' '}
              {tokens?.market_cap !== null &&
              tokens?.market_cap !== undefined ? (
                `$${dollarNonCentFormat(tokens.market_cap)}`
              ) : (
                <span className="text-xs">N/A</span>
              )}
              . The on-chain marketcap of {name} is{' '}
              {tokens.onchain_market_cap !== null &&
              tokens.onchain_market_cap !== undefined ? (
                `$${dollarNonCentFormat(tokens.onchain_market_cap)}`
              ) : (
                <span className="text-xs">N/A</span>
              )}
              . {name}&apos;s 24-hour trading volume is{' '}
              {tokens.volume_24h !== null && tokens.volume_24h !== undefined ? (
                `$${dollarNonCentFormat(tokens.volume_24h)}`
              ) : (
                <span className="text-xs">N/A</span>
              )}
              . {tokenTicker} to USD price is updated in real-time. {name} is{' '}
              {tokens.change_24 !== null && tokens.change_24 !== undefined ? (
                tokens.change_24 > 0 ? (
                  dollarFormat(tokens.change_24) + '%'
                ) : (
                  dollarFormat(tokens.change_24) + '%'
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
            className="text-gray-600 text-sm font-semibold pt-4 pb-2"
            itemProp="name"
          >
            When was {name} created on Near Protocol?
          </h3>
          <div
            itemScope
            itemProp="acceptedAnswer"
            itemType="https://schema.org/Answer"
          >
            <div className="text-sm text-gray-600 py-2" itemProp="text">
              The{' '}
              <a href={`/address/${id}`}>
                <a className="underline">{name}</a>
              </a>{' '}
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
                <a href={`/address/${contract.receipt_predecessor_account_id}`}>
                  <a className="underline">
                    {shortenAddress(contract.receipt_predecessor_account_id)}
                  </a>
                </a>
              )}{' '}
              through this{' '}
              {contract?.transaction_hash && (
                <a href={`/txns/${contract.transaction_hash}`}>
                  <a className="underline">transaction</a>
                </a>
              )}
              . Since the creation of {name}, there has been{' '}
              {localFormat(transfers)} on-chain transfers.
            </div>
          </div>
        </div>
        <div
          itemScope
          itemProp="mainEntity"
          itemType="https://schema.org/Question"
        >
          <h3
            className="text-gray-600 text-sm font-semibold pt-4 pb-2"
            itemProp="name"
          >
            How many {name} tokens are there?
          </h3>
          <div
            itemScope
            itemProp="acceptedAnswer"
            itemType="https://schema.org/Answer"
          >
            <div className="text-sm text-gray-600 py-2" itemProp="text">
              There are currently{' '}
              {tokens?.circulating_supply !== null ? (
                `${localFormat(tokens?.circulating_supply || 0)}`
              ) : (
                <span>N/A</span>
              )}{' '}
              {tokenTicker} in circulation for a total supply of{' '}
              {tokens?.total_supply !== null &&
                tokens?.total_supply !== undefined &&
                `$${dollarNonCentFormat(tokens?.total_supply)}`}
              {tokenTicker}. {tokenTicker}&apos;s supply is split between{' '}
              {localFormat(holders)} different wallet addresses.{' '}
              {largestHolder?.account && (
                <span>
                  The largest {tokenTicker} holder is currently{' '}
                  {largestHolder?.account && (
                    <a href={`/address/${largestHolder.account}`}>
                      <a className="underline">
                        {shortenAddress(largestHolder.account)}
                      </a>
                    </a>
                  )}
                  , who currently holds{' '}
                  {tokenAmount(largestHolder?.amount, tokens?.decimals, false)}{' '}
                  {tokenTicker} of all {tokenTicker}.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
