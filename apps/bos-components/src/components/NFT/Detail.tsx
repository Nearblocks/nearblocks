/**
 * Component: NFTDetail
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Non-Fungible Token Details.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [id] - The token identifier passed as a string
 * @param {string} [tid] - The nf token identifier passed as a string
 */

import Skeleton from '@/includes/Common/Skeleton';
import ArrowDown from '@/includes/icons/ArrowDown';
import ArrowUp from '@/includes/icons/ArrowUp';
import Question from '@/includes/icons/Question';
import TokenImage from '@/includes/icons/TokenImage';
import { getConfig, shortenAddress } from '@/includes/libs';
import { Token } from '@/includes/types';

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  id: string;
  tid: string;
}

export default function ({ network, t, id, tid }: Props) {
  const [indices, setIndices] = useState<number[]>([1, 2]);
  const [token, setToken] = useState<Token>({} as Token);
  const [loading, setLoading] = useState(false);
  const config = getConfig(network);

  useEffect(() => {
    function fetchToken() {
      setLoading(true);
      asyncFetch(`${config?.backendUrl}nfts/${id}/tokens/${tid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (res: {
            body: {
              tokens: Token[];
            };
            status: number;
          }) => {
            const resp = res?.body?.tokens?.[0];
            if (res.status === 200) {
              setToken(resp);
            }
          },
        )
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    }

    fetchToken();
  }, [config?.backendUrl, id, tid]);

  const toggleItem = (index: number) => {
    if (indices.includes(index)) {
      setIndices(indices.filter((currentIndex) => currentIndex !== index));
    } else {
      setIndices([...indices, index].sort());
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-12 pt-4 mb-2">
        <div className="md:col-span-5 lg:col-span-4 pt-4">
          <div className="bg-white border rounded-xl soft-shadow p-3 aspect-square">
            {
              <Widget
                src={`${config.ownerId}/widget/bos-components.components.Shared.NFTImage`}
                props={{
                  base: token?.nft?.base_uri,
                  media: token?.media,
                  reference: token?.reference,
                  className: 'rounded max-h-full',
                  network: network,
                }}
              />
            }
          </div>
        </div>
        <div className="md:col-span-7 lg:col-span-8 md:px-4 lg:pl-8 pt-4">
          <h1 className="break-all space-x-2 text-xl text-gray-700 leading-8 font-semibold">
            {loading ? (
              <div className="w-80 max-w-xs">
                <Skeleton className="h-6" />
              </div>
            ) : (
              token?.title || token?.token
            )}
          </h1>
          <a href={`/nft-token/${id}`} className="hover:no-underline">
            <a className="break-all text-green leading-6 text-sm hover:no-underline">
              {loading ? (
                <div className="w-60 max-w-xs py-2">
                  <Skeleton className="h-4" />
                </div>
              ) : (
                <>
                  <span className="inline-flex align-middle h-5 w-5 mr-2">
                    <TokenImage
                      src={token?.nft?.icon}
                      alt={token?.nft?.name}
                      className="w-5 h-5"
                      appUrl={config.appUrl}
                    />
                  </span>
                  <span>{token?.nft?.name}</span>
                </>
              )}
            </a>
          </a>
          <Accordion.Root
            type="multiple"
            className="bg-white border rounded-xl  soft-shadow mt-4"
            defaultValue={indices}
            collapsible
          >
            <Accordion.Item value={1}>
              <Accordion.Header>
                <Accordion.Trigger
                  onClick={() => toggleItem(1)}
                  className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 border-b focus:outline-none p-3"
                >
                  <h2>Details</h2>
                  {indices.includes(1) ? (
                    <ArrowUp className="fill-current" />
                  ) : (
                    <ArrowDown className="fill-current" />
                  )}
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="text-sm text-gray-500">
                <div className="divide-solid divide-gray-200 divide-y">
                  {token?.asset && (
                    <div className="flex p-4">
                      <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <div>
                                <Question className="w-4 h-4 fill-current mr-1" />
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                              align="start"
                              side="bottom"
                            >
                              Current owner of this NFT
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                        Owner:
                      </div>
                      <div className="w-full xl:w-3/4 word-break">
                        <a
                          href={`/address/${token.asset.owner}`}
                          className="hover:no-underline"
                        >
                          <a className="text-green hover:no-underline">
                            {shortenAddress(token.asset.owner)}
                          </a>
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div>
                              <Question className="w-4 h-4 fill-current mr-1" />
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Content
                            className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                            align="start"
                            side="bottom"
                          >
                            Address of this NFT contract
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                      Contract Address:
                    </div>
                    <div className="w-full xl:w-3/4 word-break">
                      <a href={`/address/${id}`} className="hover:no-underline">
                        <a className="text-green hover:no-underline">
                          {shortenAddress(id)}
                        </a>
                      </a>
                    </div>
                  </div>
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div>
                              <Question className="w-4 h-4 fill-current mr-1" />
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Content
                            className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                            align="start"
                            side="bottom"
                          >
                            {"This NFT's unique token ID"}
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                      Token ID:
                    </div>
                    <div className="w-full xl:w-3/4 word-break">{tid}</div>
                  </div>
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <Tooltip.Provider>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div>
                              <Question className="w-4 h-4 fill-current mr-1" />
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Content
                            className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                            align="start"
                            side="bottom"
                          >
                            The standard followed by this NFT
                          </Tooltip.Content>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                      Token Standard:
                    </div>
                    <div className="w-full xl:w-3/4 word-break">NEP-171</div>
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
            {token?.description && (
              <Accordion.Item value={2}>
                <Accordion.Trigger
                  onClick={() => toggleItem(2)}
                  className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 border-b focus:outline-none p-3"
                >
                  <h2>Description</h2>
                  {indices.includes(2) ? (
                    <ArrowUp className="fill-current" />
                  ) : (
                    <ArrowDown className="fill-current" />
                  )}
                </Accordion.Trigger>
                <Accordion.Content className="text-sm text-gray-500 border-b p-3">
                  {token.description}
                </Accordion.Content>
              </Accordion.Item>
            )}
          </Accordion.Root>
        </div>
      </div>
      <div className="py-6"></div>
      <div className="block lg:flex lg:space-x-2 mb-10">
        <div className="w-full ">
          <div className="bg-white soft-shadow rounded-xl pb-1">
            {
              <Widget
                src={`${config.ownerId}/widget/bos-components.components.NFT.TokenTransfers`}
                props={{
                  network: network,
                  t: t,
                  id: id,
                  tid: tid,
                }}
              />
            }
          </div>
        </div>
      </div>
    </>
  );
}
