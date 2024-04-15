/**
 * Component: NFTInventory
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Non-Fungible Token Inventory List.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [id] - The token identifier passed as a string
 * @param {Token} [token] - The Token type passed as object
 * @param {string} ownerId - The identifier of the owner of the component.
 */

import Paginator from '@/includes/Common/Paginator';
import Skeleton from '@/includes/Common/Skeleton';
import { Token } from '@/includes/types';

interface Props {
  ownerId: string;
  network: string;
  id: string;
  token: Token;
}

export default function ({ network, id, token, ownerId }: Props) {
  const { localFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [isLoading, setIsLoading] = useState(false);
  const initialPage = 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [tokens, setTokens] = useState<Token[]>([]);

  const config = getConfig && getConfig(network);

  const [tokenData, setTokenData] = useState<Token>({} as Token);

  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

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
              setTokenData(resp);
              setIsLoading(false);
            } else {
              handleRateLimit(data, fetchNFTData, () => setIsLoading(false));
            }
          },
        )
        .catch(() => {});
    }

    function fetchTotalToken() {
      asyncFetch(`${config?.backendUrl}nfts/${id}/tokens/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              tokens: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.tokens?.[0];
            if (data.status === 200) {
              setTotalCount(resp?.count);
            } else {
              handleRateLimit(data, fetchTotalToken);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTokenData() {
      setIsLoading(true);

      asyncFetch(
        `${config?.backendUrl}nfts/${id}/tokens?page=${currentPage}&per_page=24`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then((data: { body: { tokens: Token[] }; status: number }) => {
          const resp = data?.body?.tokens;
          if (data.status === 200 && Array.isArray(resp) && resp.length > 0) {
            setTokens(resp);
            setIsLoading(false);
          } else {
            handleRateLimit(data, fetchTokenData, () => setIsLoading(false));
          }
        })
        .catch(() => {});
    }
    if (!token && token === undefined) {
      fetchNFTData();
    }
    if (config?.backendUrl) {
      fetchTotalToken();
      fetchTokenData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, currentPage, id, token]);

  useEffect(() => {
    if (token) {
      setTokenData(token);
    }
  }, [token]);

  return (
    <>
      {isLoading ? (
        <div className="pl-6 max-w-lg w-full py-5 ">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div
          className={`flex flex-col lg:flex-row pt-4 border-b dark:border-black-200`}
        >
          <div className="flex flex-col">
            <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
              A total of {localFormat && localFormat(totalCount.toString())}{' '}
              tokens found
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 m-6">
        {isLoading &&
          [...Array(24)].map((_, i) => (
            <div
              className="max-w-full border rounded p-3 mx-auto md:mx-0"
              key={i}
            >
              <a
                href="#"
                className="flex items-center justify-center m-auto overflow-hidden"
              >
                <div className="w-40 h-40 ">
                  <Skeleton className="h-40" />
                </div>
              </a>
              <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10 mt-4">
                <Skeleton className="h-4" />
              </div>
              <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10">
                <Skeleton className="h-4" />
              </div>
            </div>
          ))}
        {!isLoading &&
          tokens &&
          tokens?.map((nft: Token) => (
            <div
              className="max-w-full border dark:border-black-200 rounded p-3 mx-auto md:mx-0"
              key={nft?.contract + nft?.token}
            >
              <Link
                href={`/nft-token/${nft?.contract}/${nft?.token}`}
                className="hover:no-underline"
              >
                <a className="w-40 h-40 flex items-center justify-center m-auto overflow-hidden hover:no-underline">
                  {
                    <Widget
                      src={`${ownerId}/widget/bos-components.components.Shared.NFTImage`}
                      props={{
                        base: tokenData.base_uri,
                        reference: nft.reference,
                        media: nft.media,
                        className: 'rounded max-h-full',
                        network: network,
                        ownerId,
                      }}
                    />
                  }
                </a>
              </Link>
              <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10 mt-4">
                Token ID:{' '}
                <Link
                  href={`/nft-token/${nft?.contract}/${nft?.token}`}
                  className="hover:no-underline"
                >
                  <a className="text-green dark:text-green-250 hover:no-underline">
                    {nft?.token}
                  </a>
                </Link>
              </div>
              {nft?.asset && (
                <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10">
                  Owner:{' '}
                  <Link
                    href={`/address/${nft?.asset?.owner}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green dark:text-green-250 hover:no-underline">
                      {nft?.asset?.owner}
                    </a>
                  </Link>
                </div>
              )}
            </div>
          ))}
      </div>
      <Paginator
        count={totalCount}
        page={currentPage}
        setPage={setPage}
        limit={24}
        pageLimit={200}
      />
    </>
  );
}
