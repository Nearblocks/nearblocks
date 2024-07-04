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
 * @param {string} ownerId - The identifier of the owner of the component.
 */

import Skeleton from '@/includes/Common/Skeleton';
import ArrowDown from '@/includes/icons/ArrowDown';
import ArrowUp from '@/includes/icons/ArrowUp';
import Question from '@/includes/icons/Question';
import TokenImage from '@/includes/icons/TokenImage';
import WarningIcon from '@/includes/icons/WarningIcon';
import { SpamToken, Token } from '@/includes/types';

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string | undefined;
  id: string;
  tid: string;
  userApiUrl: string;
}

export default function ({ network, t, id, tid, ownerId, userApiUrl }: Props) {
  const { getConfig, handleRateLimit, shortenAddress, fetchData } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [indices, setIndices] = useState<number[]>([1, 2]);
  const [token, setToken] = useState<Token>({} as Token);
  const [loading, setLoading] = useState(false);
  const [spamTokens, setSpamTokens] = useState<SpamToken>({ blacklist: [] });
  const [isVisible, setIsVisible] = useState(true);

  const config = getConfig && getConfig(network);

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
              setLoading(false);
            } else {
              handleRateLimit(res, fetchToken, () => setLoading(false));
            }
          },
        )
        .catch(() => {});
    }
    fetchData &&
      fetchData(
        'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
        (response: any) => {
          const data = JSON.parse(response);
          setSpamTokens(data);
        },
      );

    if (config?.backendUrl) {
      fetchToken();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, id, tid]);

  const toggleItem = (index: number) => {
    if (indices.includes(index)) {
      setIndices(indices.filter((currentIndex) => currentIndex !== index));
    } else {
      setIndices([...indices, index].sort());
    }
  };

  function isTokenSpam(tokenName: string) {
    if (spamTokens)
      for (const spamToken of spamTokens.blacklist) {
        const cleanedToken = spamToken.replace(/^\*/, '');
        if (tokenName.endsWith(cleanedToken)) {
          return true;
        }
      }
    return false;
  }
  const handleClose = () => {
    setIsVisible(false);
  };
  return (
    <div className="container mx-auto px-3">
      {isTokenSpam(token.contract || id) && isVisible && (
        <>
          <div className="py-2"></div>
          <div className="w-full flex justify-between text-left border dark:bg-nearred-500  dark:border-nearred-400 dark:text-nearred-300 bg-red-50 border-red-100 text-red-500 text-sm rounded-lg p-4">
            <p className="items-center">
              <WarningIcon className="w-5 h-5 fill-current mx-1 inline-flex" />
              This token is reported to have been spammed to many users. Please
              exercise caution when interacting with it. Click
              <a
                href="https://github.com/Nearblocks/spam-token-list"
                className="underline mx-0.5"
                target="_blank"
              >
                here
              </a>
              for more info.
            </p>
            <span
              className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-400 cursor-pointer"
              onClick={handleClose}
            >
              X
            </span>
          </div>
        </>
      )}
      <div className="grid md:grid-cols-12 pt-4 mb-2">
        <div className="md:col-span-5 lg:col-span-4 pt-4">
          <div className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-xl soft-shadow p-3 aspect-square">
            {
              <Widget
                src={`${ownerId}/widget/bos-components.components.Shared.NFTImage`}
                props={{
                  base: token?.nft?.base_uri,
                  media: token?.media,
                  reference: token?.reference,
                  className: 'rounded max-h-full',
                  network: network,
                  ownerId,
                }}
              />
            }
          </div>
        </div>
        <div className="md:col-span-7 lg:col-span-8 md:px-4 lg:pl-8 pt-4">
          <h1 className="break-all space-x-2 text-xl text-gray-700 dark:text-neargray-10 leading-8 font-semibold">
            {loading ? (
              <div className="w-80 max-w-xs">
                <Skeleton className="h-6" />
              </div>
            ) : (
              token?.title || token?.token
            )}
          </h1>
          <Link href={`/nft-token/${id}`} className="hover:no-underline">
            <a className="break-all text-green dark:text-green-250 leading-6 text-sm hover:no-underline">
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
                      appUrl={config?.appUrl}
                    />
                  </span>
                  <span>{token?.nft?.name}</span>
                </>
              )}
            </a>
          </Link>
          <Accordion.Root
            type="multiple"
            className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-xl  soft-shadow mt-4"
            defaultValue={indices}
            collapsible
          >
            <Accordion.Item value={1}>
              <Accordion.Header>
                <Accordion.Trigger
                  onClick={() => toggleItem(1)}
                  className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-neargray-10 border-b dark:border-black-200 focus:outline-none p-3"
                >
                  <h2>Details</h2>
                  {indices?.includes(1) ? (
                    <ArrowUp className="fill-current" />
                  ) : (
                    <ArrowDown className="fill-current" />
                  )}
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="divide-solid divide-gray-200 dark:divide-black-200 divide-y">
                  {token?.asset && (
                    <div className="flex p-4">
                      <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                        <OverlayTrigger
                          placement="bottom-start"
                          delay={{ show: 500, hide: 0 }}
                          overlay={
                            <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                              Current owner of this NFT
                            </Tooltip>
                          }
                        >
                          <div>
                            <Question className="w-4 h-4 fill-current mr-1" />
                          </div>
                        </OverlayTrigger>
                        Owner:
                      </div>
                      <div className="w-full xl:w-3/4 word-break">
                        <Link
                          href={`/address/${token?.asset?.owner}`}
                          className="hover:no-underline"
                        >
                          <a className="text-green dark:text-green-250 hover:no-underline">
                            {shortenAddress &&
                              shortenAddress(token?.asset?.owner ?? '')}
                          </a>
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <OverlayTrigger
                        placement="bottom-start"
                        delay={{ show: 500, hide: 0 }}
                        overlay={
                          <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                            Address of this NFT contract
                          </Tooltip>
                        }
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </OverlayTrigger>
                      Contract Address:
                    </div>
                    <div className="w-full xl:w-3/4 word-break">
                      <Link
                        href={`/address/${id}`}
                        className="hover:no-underline"
                      >
                        <a className="text-green  dark:text-green-250 hover:no-underline">
                          {shortenAddress && shortenAddress(id ?? '')}
                        </a>
                      </Link>
                    </div>
                  </div>
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <OverlayTrigger
                        placement="bottom-start"
                        delay={{ show: 500, hide: 0 }}
                        overlay={
                          <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                            {"This NFT's unique token ID"}
                          </Tooltip>
                        }
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </OverlayTrigger>
                      Token ID:
                    </div>
                    <div className="w-full xl:w-3/4 word-break">{tid}</div>
                  </div>
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <OverlayTrigger
                        placement="bottom-start"
                        delay={{ show: 500, hide: 0 }}
                        overlay={
                          <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2">
                            The standard followed by this NFT
                          </Tooltip>
                        }
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </OverlayTrigger>
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
                  className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-neargray-10 border-b dark:border-black-200 focus:outline-none p-3"
                >
                  <h2>Description</h2>
                  {indices.includes(2) ? (
                    <ArrowUp className="fill-current" />
                  ) : (
                    <ArrowDown className="fill-current" />
                  )}
                </Accordion.Trigger>
                <Accordion.Content className="text-sm text-nearblue-600 dark:text-neargray-10 border-b dark:border-black-200 p-3">
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
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
            {
              <Widget
                src={`${ownerId}/widget/bos-components.components.NFT.TokenTransfers`}
                props={{
                  network: network,
                  t: t,
                  id: id,
                  tid: tid,
                  ownerId,
                }}
              />
            }
          </div>
        </div>
      </div>
      <div className="mb-10">
        {
          <Widget
            src={`${ownerId}/widget/includes.Common.Banner`}
            props={{ type: 'center', userApiUrl: userApiUrl }}
          />
        }
      </div>
    </div>
  );
}
