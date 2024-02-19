/**
 * Component: NFTOverview
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Non-Fungible Token Overview.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [id] - The token identifier passed as a string
 */

interface Props {
  network: string;
  id: string;
}

import Links from '@/includes/Common/Links';
import Skeleton from '@/includes/Common/Skeleton';
import { localFormat } from '@/includes/formats';
import TokenImage from '@/includes/icons/TokenImage';
import { getConfig } from '@/includes/libs';
import { Token } from '@/includes/types';

const tabs = ['Transfers', 'Holders', 'Inventory', 'Comments'];

export default function ({ network, id }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);
  const [holderLoading, setHolderLoading] = useState(false);
  const [token, setToken] = useState<Token>({} as Token);
  const [transfers, setTransfers] = useState('');
  const [holders, setHolders] = useState('');
  const [pageTab, setPageTab] = useState('Transfers');

  const config = getConfig(network);

  useEffect(() => {
    function fetchNFTData() {
      setIsLoading(true);
      asyncFetch(`${config.backendUrl}nfts/${id}`)
        .then(
          (data: {
            body: {
              contracts: Token[];
            };
            status: number;
          }) => {
            const resp = data?.body?.contracts?.[0];
            if (data.status === 200) {
              setToken(resp);
              setIsLoading(false);
            }
          },
        )
        .catch(() => {});
    }

    function fetchTxnsCount() {
      setTxnLoading(true);
      asyncFetch(`${config.backendUrl}nfts/${id}/txns/count`)
        .then(
          (data: {
            body: {
              txns: { count: string }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns?.[0];
            if (data.status === 200) {
              setTransfers(resp.count);
              setTxnLoading(false);
            }
          },
        )
        .catch(() => {});
    }

    function fetchHoldersCount() {
      setHolderLoading(true);
      asyncFetch(`${config.backendUrl}nfts/${id}/holders/count`)
        .then(
          (data: {
            body: {
              holders: { count: string }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.holders?.[0];
            if (data.status === 200) {
              setHolders(resp.count);
              setHolderLoading(false);
            }
          },
        )
        .catch(() => {});
    }

    fetchNFTData();
    fetchTxnsCount();
    fetchHoldersCount();
  }, [config.backendUrl, id]);

  const onTab = (index: number) => {
    setPageTab(tabs[index]);
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap pt-4">
        {!token ? (
          <div className="w-80 max-w-xs px-3 py-5">
            <Skeleton className="h-7" />
          </div>
        ) : (
          <h1 className="break-all space-x-2 text-xl text-nearblue-600 leading-8 py-4 px-2">
            <span className="inline-flex align-middle h-7 w-7">
              <TokenImage
                src={token?.icon}
                alt={token?.name}
                className="w-7 h-7"
                appUrl={config?.appUrl}
              />
            </span>
            <span className="inline-flex align-middle ">Token: </span>
            <span className="inline-flex align-middle font-semibold">
              {token?.name}
            </span>
          </h1>
        )}
      </div>
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-xl">
              <h2 className="border-b p-3 text-nearblue-600 text-sm font-semibold">
                Overview
              </h2>

              <div className="px-3 divide-y text-sm text-nearblue-600">
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Total Supply:
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {token?.tokens ? localFormat(token?.tokens) : ''}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Transfers:
                  </div>
                  {txnLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {transfers ? localFormat(transfers) : ''}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Holders:</div>
                  {holderLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <div className="w-full md:w-3/4 break-words">
                      {holders ? localFormat(holders) : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="h-full bg-white soft-shadow rounded-xl overflow-hidden">
              <h2 className="border-b p-3 text-nearblue-600 text-sm font-semibold">
                Profile Summary
              </h2>
              <div className="px-3 divide-y text-sm text-nearblue-600">
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">Contract:</div>
                  {isLoading ? (
                    <div className="w-full md:w-3/4 break-words">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="w-full text-green-500 md:w-3/4 break-words">
                      <a
                        href={`/address/${token?.contract}`}
                        className="hover:no-underline"
                      >
                        <a className="text-green-500 hover:no-underline">
                          {token?.contract}
                        </a>
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Official Site:
                  </div>
                  <div className="w-full md:w-3/4 text-green-500 break-words">
                    {isLoading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <a
                        href={`${token?.website}`}
                        className="hover:no-underline"
                      >
                        {token?.website}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0 ">
                    Social Profiles:
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    {/* corrections needed */}
                    {isLoading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <Links meta={token} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-6"></div>
        <div className="block lg:flex lg:space-x-2 mb-4">
          <div className="w-full">
            <Tabs.Root defaultValue={pageTab}>
              <Tabs.List>
                {tabs &&
                  tabs?.map((tab, index) => (
                    <Tabs.Trigger
                      key={index}
                      onClick={() => onTab(index)}
                      className={`text-nearblue-600 text-sm font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none ${
                        pageTab === tab
                          ? 'rounded-lg bg-green-600 text-white'
                          : 'hover:bg-neargray-800 bg-neargray-700 rounded-lg hover:text-nearblue-600'
                      }`}
                      value={tab}
                    >
                      <h2>{tab}</h2>
                    </Tabs.Trigger>
                  ))}
              </Tabs.List>
              <div className="bg-white soft-shadow rounded-xl pb-1">
                <Tabs.Content value={tabs[0]}>
                  {
                    <Widget
                      src={`${config?.ownerId}/widget/bos-components.components.NFT.Transfers`}
                      props={{
                        network: network,
                        id: id,
                      }}
                    />
                  }
                </Tabs.Content>
                <Tabs.Content value={tabs[1]}>
                  {
                    <Widget
                      src={`${config?.ownerId}/widget/bos-components.components.NFT.Holders`}
                      props={{
                        network: network,
                        id: id,
                      }}
                    />
                  }
                </Tabs.Content>
                <Tabs.Content value={tabs[2]}>
                  {
                    <Widget
                      src={`${config?.ownerId}/widget/bos-components.components.NFT.Inventory`}
                      props={{
                        network: network,
                        id: id,
                      }}
                    />
                  }
                </Tabs.Content>
                <Tabs.Content value={tabs[3]}>
                  <div className="px-4 sm:px-6 py-3"></div>
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>
        </div>
      </div>
    </>
  );
}
