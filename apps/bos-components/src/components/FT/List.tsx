/**
 * Component: FTList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Top Tokens on Near Protocol.
 * @interface Props
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 * @param {string} ownerId - The identifier of the owner of the component.
 */
interface Props {
  ownerId: string;
  network: string;
  t: (key: string, options?: { count?: number }) => string | undefined;
  currentPage: number;
  setPage: (page: number) => void;
}

import TokenImage from '@/includes/icons/TokenImage';
import { Sorting, Token } from '@/includes/types';
import ArrowDown from '@/includes/icons/ArrowDown';
import SortIcon from '@/includes/icons/SortIcon';
import Question from '@/includes/icons/Question';
import Skeleton from '@/includes/Common/Skeleton';

const initialSorting: Sorting = {
  sort: 'onchain_market_cap',
  order: 'desc',
};
const initialPagination = {
  per_page: 50,
};
export default function ({ t, network, currentPage, setPage, ownerId }: Props) {
  const { localFormat, dollarFormat, dollarNonCentFormat, serialNumber } =
    VM.require(`${ownerId}/widget/includes.Utils.formats`);

  const { debounce, getConfig, handleRateLimit } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [tokens, setTokens] = useState<{ [key: number]: Token[] }>({});

  const [sorting, setSorting] = useState<Sorting>(initialSorting);
  const errorMessage = t ? t('token:fts.top.empty') : 'No tokens found!';

  const config = getConfig && getConfig(network);

  const ArrowUp = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        className="h-3 w-3 fill-current mr-1"
      >
        <path fill="none" d="M0 0h24v24H0z" />
        <path d="M12 10.828l-4.95 4.95-1.414-1.414L12 8l6.364 6.364-1.414 1.414z" />
      </svg>
    );
  };

  useEffect(() => {
    function fetchTotalTokens(qs?: string) {
      const queryParams = qs ? '?' + qs : '';
      asyncFetch(`${config?.backendUrl}fts/count${queryParams}`, {
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
              setTotalCount(resp?.count ?? 0);
            } else {
              handleRateLimit(data, () => fetchTotalTokens(qs));
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTokens(qs: string, sqs: Sorting, page: number) {
      setIsLoading(true);
      const queryParams = qs ? qs + '&' : '';
      asyncFetch(
        `${config?.backendUrl}fts?${queryParams}order=${sqs?.order}&sort=${sqs?.sort}&page=${page}&per_page=50`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then(
          (data: {
            body: {
              tokens: Token[];
            };
            status: number;
          }) => {
            const resp = data?.body?.tokens;
            if (data.status === 200) {
              setTokens((prevData) => ({ ...prevData, [page]: resp || [] }));
              setIsLoading(false);
            } else {
              handleRateLimit(
                data,
                () => fetchTokens(qs, sorting, page),
                () => setIsLoading(false),
              );
            }
          },
        )
        .catch(() => {});
    }

    fetchTotalTokens();
    fetchTokens('', sorting, currentPage);
    if (sorting) {
      fetchTotalTokens();
      fetchTokens('', sorting, currentPage);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, currentPage, sorting]);

  const onOrder = (sortKey: string) => {
    setSorting((state) => ({
      ...state,
      sort: sortKey,
      order:
        state.sort === sortKey
          ? state.order === 'asc'
            ? 'desc'
            : 'asc'
          : 'desc',
    }));
  };

  const debouncedSearch = useMemo(() => {
    return (
      debounce &&
      debounce(500, (value: string) => {
        if (!value || value.trim() === '') {
          setSearchResults([]);
          return;
        }
        asyncFetch(`${config?.backendUrl}fts?search=${value}&per_page=5`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((data: { body: { tokens: Token[] } }) => {
            const resp = data?.body?.tokens;
            setSearchResults(resp);
          })
          .catch(() => {});
      })
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const columns = [
    {
      header: <span>#</span>,
      key: '',
      cell: (_row: Token, index: number) => (
        <span>
          {serialNumber(index, currentPage, initialPagination.per_page)}
        </span>
      ),
      tdClassName:
        'pl-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>{t ? t('token:fts.top.token') : 'TOKEN'}</span>,
      key: 'name',
      cell: (row: Token) => (
        <>
          <div className="flex items-center">
            <TokenImage
              src={row?.icon}
              alt={row?.name}
              appUrl={config?.appUrl}
              className="w-5 h-5 mr-2"
            />
            <Link
              href={`/token/${row?.contract}`}
              className="hover:no-underline"
            >
              <a className=" text-green-500 hover:no-underline">
                <span className="inline-block truncate max-w-[200px] mr-1">
                  {row?.name}
                </span>
                <span className="text-nearblue-700 inline-block truncate max-w-[80px]">
                  {row?.symbol}
                </span>
              </a>
            </Link>
          </div>
        </>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 w-80  align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>{t ? t('token:fts.top.price') : 'PRICE'}</span>,
      key: 'price',
      cell: (row: Token) => (
        <span>
          {row?.price === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            ` $${localFormat(row?.price)}`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: (
        <span className=" whitespace-nowrap">
          {t ? t('token:fts.top.change') : 'CHANGE'} (%)
        </span>
      ),
      key: 'change_24',
      cell: (row: Token) => (
        <span>
          {row?.change_24 === null ? (
            <span className="text-xs">N/A</span>
          ) : Number(row?.change_24) > 0 ? (
            <div className="text-neargreen flex flex-row items-center">
              <ArrowUp />+{dollarFormat(row?.change_24)}%
            </div>
          ) : (
            <div className="text-red-500 flex flex-row items-center">
              <ArrowDown className="h-3 w-3 fill-current mr-1" />
              {row?.change_24 ? dollarFormat(row?.change_24) + '%' : ''}
            </div>
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>{t ? t('token:fts.top.volume') : 'VOLUME'} (24H)</span>,
      key: 'volume_24h',
      cell: (row: Token) => (
        <span>
          {row?.volume_24h === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row?.volume_24h)}`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: (
        <span className="flex">
          <span className="uppercase whitespace-nowrap">Circulating MC</span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  <Question className="w-4 h-4 fill-current ml-1" />
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 "
                align="start"
                side="bottom"
              >
                {
                  'Calculated by multiplying the number of tokens in circulating supply across all chains with the current market price per token.'
                }
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      key: 'market_cap',
      cell: (row: Token) => (
        <span>
          {row?.market_cap === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row?.market_cap)}`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: (
        <span>
          {' '}
          <button
            type="button"
            onClick={() => onOrder('onchain_market_cap')}
            className="w-full px-6 py-2 text-left text-xs font-semibold  tracking-wider text-green-500 focus:outline-none flex flex-row"
          >
            {sorting?.sort === 'onchain_market_cap' && (
              <div className="text-nearblue-600 font-semibold">
                <SortIcon order={sorting?.order} />
              </div>
            )}
            <span className="uppercase whitespace-nowrap">On-Chain MC</span>
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>
                    <Question className="w-4 h-4 fill-current ml-1" />
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  align="start"
                  side="bottom"
                >
                  {
                    "Calculated by multiplying the token's Total Supply on Near with the current market price per token"
                  }
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </button>
        </span>
      ),
      key: 'onchain_market_cap',
      cell: (row: Token) => (
        <span>
          {row?.onchain_market_cap === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${
              row?.onchain_market_cap
                ? dollarNonCentFormat(row?.onchain_market_cap)
                : row?.onchain_market_cap ?? ''
            }`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top',
    },
    // {
    //   header: (
    //     <span>
    //       <button
    //         type="button"
    //         onClick={() => onOrder('holders')}
    //         className="w-full px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex flex-row"
    //       >
    //         {sorting?.sort === 'holders' && (
    //           <div className="text-nearblue-600 font-semibold">
    //             <SortIcon order={sorting?.order} />
    //           </div>
    //         )}
    //         Holders
    //       </button>{' '}
    //     </span>
    //   ),
    //   key: 'holders',
    //   cell: (row: Token) => (
    //     <span>{row?.holders ? localFormat(row?.holders) : ''}</span>
    //   ),
    //   tdClassName:
    //     'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top',
    // },
  ];

  return (
    <div className=" bg-white border soft-shadow rounded-xl pb-1 ">
      <div className="flex flex-row items-center justify-between text-left text-sm text-nearblue-600 px-3 py-2">
        {isLoading ? (
          <div className="max-w-lg w-full pl-3">
            <Skeleton className="h-4" />
          </div>
        ) : (
          <p className="pl-3">
            {t
              ? t('token:fts.top.listing', { count: totalCount })
              : `A total of ${totalCount} Token Contracts found`}
          </p>
        )}
        <div className={`flex w-full h-10 sm:w-80 mr-2`}>
          <div className="flex-grow">
            <label htmlFor="token-search" id="token-search">
              <input
                name="search"
                autoComplete="off"
                placeholder="Search"
                className="search ml-2 pl-8 token-search bg-white w-full h-full text-sm py-2 outline-none border rounded-xl"
                onChange={onChange}
              />
            </label>
            {searchResults?.length > 0 && (
              <div className="z-50 relative">
                <div className="text-xs rounded-b-md -mr-2 ml-2 -mt-1 bg-white py-2 shadow">
                  {searchResults.map((token) => (
                    <div
                      key={token?.contract}
                      className="mx-2 px-2 py-2 hover:bg-gray-100 cursor-pointer hover:border-gray-500 truncate"
                    >
                      <Link
                        href={`/token/${token?.contract}`}
                        className="hover:no-underline"
                      >
                        <a className="hover:no-underline flex items-center my-1 whitespace-nowrap ">
                          <div className="flex-shrink-0 h-5 w-5 mr-2">
                            <TokenImage
                              src={token?.icon}
                              alt={token?.name}
                              appUrl={config?.appUrl}
                              className="w-5 h-5"
                            />
                          </div>
                          <p className="font-semibold text-sm truncate">
                            {token?.name}
                            <span className="text-nearblue-700 ml-2">
                              {token?.symbol}
                            </span>
                          </p>
                        </a>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Widget
        src={`${ownerId}/widget/bos-components.components.Shared.Table`}
        props={{
          columns: columns,
          data: tokens[currentPage],
          isLoading: isLoading,
          isPagination: true,
          count: totalCount,
          page: currentPage,
          limit: 50,
          pageLimit: 200,
          setPage: setPage,
          Error: errorMessage,
        }}
      />
    </div>
  );
}
