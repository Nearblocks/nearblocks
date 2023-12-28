/**
 * Component: FTList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Top Tokens on Near Protocol.
 * @interface Props
 *  @property {Function} t - A function for internationalization (i18n) provided by the next-translate package.
 *  @param {string}  [network] - The network data to show, either mainnet or testnet.
 *  @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 *  @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 */
interface Props {
  network: string;
  t: (key: string, options?: { count?: number }) => string | undefined;
  currentPage: number;
  setPage: (page: number) => void;
}

import {
  localFormat,
  dollarFormat,
  dollarNonCentFormat,
  serialNumber,
} from '@/includes/formats';
import { debounce, getConfig } from '@/includes/libs';
import TokenImage from '@/includes/icons/TokenImage';
import { Sorting, Token } from '@/includes/types';
import Skelton from '@/includes/Common/Skelton';
import ArrowDown from '@/includes/icons/ArrowDown';
import SortIcon from '@/includes/icons/SortIcon';
import Question from '@/includes/icons/Question';

const initialSorting: Sorting = {
  sort: 'onchain_market_cap',
  order: 'desc',
};
const initialPagination = {
  per_page: 50,
};
export default function ({ t, network, currentPage, setPage }: Props) {
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [tokens, setTokens] = useState<Token[]>([]);

  const [sorting, setSorting] = useState<Sorting>(initialSorting);

  const config = getConfig(network);
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
      setIsLoading(true);
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
          }) => {
            const resp = data?.body?.tokens?.[0];
            setTotalCount(resp?.count);
          },
        )
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }

    function fetchTokens(qs?: string, sqs?: Sorting) {
      const queryParams = qs ? qs + '&' : '';
      asyncFetch(
        `${config?.backendUrl}fts?${queryParams}order=${sqs?.order}&sort=${sqs?.sort}&page=${currentPage}&per_page=25`,
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
          }) => {
            const resp = data?.body?.tokens;
            setTokens(resp);
          },
        )
        .catch(() => {});
    }

    fetchTotalTokens();
    fetchTokens('', sorting);
    if (sorting) {
      fetchTotalTokens();
      fetchTokens('', sorting);
    }
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
        'pl-6 py-4 whitespace-nowrap text-sm text-gray-400 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: (
        <span>
          <button
            type="button"
            onClick={() => onOrder('name')}
            className="w-full px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex flex-row"
          >
            {sorting.sort === 'name' && (
              <div className="text-gray-500 font-semibold">
                <SortIcon order={sorting.order} />
              </div>
            )}
            {t ? t('token:fts.top.token') : 'TOKEN'}
          </button>
        </span>
      ),
      key: 'name',
      cell: (row: Token) => (
        <span>
          <div className="flex items-center">
            <TokenImage
              src={row?.icon}
              alt={row?.name}
              appUrl={config.appUrl}
              className="w-5 h-5 mr-2"
            />
            <a href={`/token/${row.contract}`}>
              <a className=" text-green-500 ">
                <span className="inline-block truncate max-w-[200px] mr-1">
                  {row.name}
                </span>
                <span className="text-gray-400 inline-block truncate max-w-[80px]">
                  {row.symbol}
                </span>
              </a>
            </a>
          </div>
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top',
    },
    {
      header: (
        <span>
          {' '}
          <button
            type="button"
            onClick={() => onOrder('price')}
            className="w-full px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex flex-row"
          >
            {sorting.sort === 'price' && (
              <div className="text-gray-500">
                <SortIcon order={sorting.order} />
              </div>
            )}
            {t ? t('token:fts.top.price') : 'PRICE'}
          </button>
        </span>
      ),
      key: 'price',
      cell: (row: Token) => (
        <span>
          {row.price === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            ` $${localFormat(row.price || 0)}`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top',
    },
    {
      header: (
        <span>
          <button
            type="button"
            onClick={() => onOrder('change')}
            className="w-full px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex flex-row"
          >
            {sorting.sort === 'change' && (
              <div className="text-gray-500 font-semibold">
                <SortIcon order={sorting.order} />
              </div>
            )}
            {t ? t('token:fts.top.change') : 'CHANGE'}(%)
          </button>
        </span>
      ),
      key: 'change_24',
      cell: (row: Token) => (
        <span>
          {row.change_24 === null ? (
            <span className="text-xs">N/A</span>
          ) : row.change_24 > 0 ? (
            <div className="text-neargreen flex flex-row items-center">
              <ArrowUp />+{dollarFormat(row.change_24)}%
            </div>
          ) : (
            <div className="text-red-500 flex flex-row items-center">
              <ArrowDown className="h-3 w-3 fill-current mr-1" />
              {dollarFormat(row.change_24)}%
            </div>
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top',
    },
    {
      header: (
        <span>
          <button
            type="button"
            onClick={() => onOrder('volume')}
            className="w-full px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex flex-row"
          >
            {sorting.sort === 'volume' && (
              <div className="text-gray-500 font-semibold">
                <SortIcon order={sorting.order} />
              </div>
            )}
            {t ? t('token:fts.top.volume') : 'VOLUME'} (24H)
          </button>
        </span>
      ),
      key: 'volume_24h',
      cell: (row: Token) => (
        <span>
          {row.volume_24h === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row.volume_24h)}`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top',
    },
    {
      header: (
        <span>
          <button
            type="button"
            onClick={() => onOrder('market_cap')}
            className="w-full px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex flex-row"
          >
            {sorting.sort === 'market_cap' && (
              <div className="text-gray-500 font-semibold">
                <SortIcon order={sorting.order} />
              </div>
            )}
            Circulating MC
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>
                    <Question className="w-4 h-4 fill-current ml-1" />
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  sideOffset={8}
                  place="bottom"
                >
                  {
                    ' Calculated by multiplying the number of tokens in circulating supply across all chains with the current market price per token.'
                  }
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          </button>
        </span>
      ),
      key: 'market_cap',
      cell: (row: Token) => (
        <span>
          {row.market_cap === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row.market_cap)}`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top',
    },
    {
      header: (
        <span>
          {' '}
          <button
            type="button"
            onClick={() => onOrder('onchain_market_cap')}
            className="w-full px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex flex-row"
          >
            {sorting.sort === 'onchain_market_cap' && (
              <div className="text-gray-500 font-semibold">
                <SortIcon order={sorting.order} />
              </div>
            )}
            On-Chain MC
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span>
                    <Question className="w-4 h-4 fill-current ml-1" />
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  sideOffset={8}
                  place="bottom"
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
          {row.onchain_market_cap === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row.onchain_market_cap)}`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top',
    },
    {
      header: (
        <span>
          <button
            type="button"
            onClick={() => onOrder('holders')}
            className="w-full px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex flex-row"
          >
            {sorting.sort === 'holders' && (
              <div className="text-gray-500 font-semibold">
                <SortIcon order={sorting.order} />
              </div>
            )}
            Holders
          </button>{' '}
        </span>
      ),
      key: 'holders',
      cell: (row: Token) => <span>{localFormat(row.holders)}</span>,
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top',
    },
  ];

  const debouncedSearch = useMemo(() => {
    return debounce(500, (value: string) => {
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
    });
  }, [config?.backendUrl]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };
  return (
    <>
      <div className="flex flex-row items-center justify-between text-left text-sm text-gray-500 px-3 py-2">
        {isLoading ? (
          <Skelton className="max-w-lg pl-3" />
        ) : (
          <p className="pl-3">
            {t
              ? t('token:fts.top.listing', { count: totalCount })
              : `A total of ${totalCount} Token Contracts found`}
          </p>
        )}
        <div className={`flex w-full h-10 sm:w-80 mr-2`}>
          <div className="flex-grow">
            <label htmlFor="token-search" className="relative">
              <input
                name="search"
                autoComplete="off"
                placeholder="Search"
                className="search ml-2 pl-8 token-search bg-white w-full h-full text-sm py-2 outline-none border rounded-lg"
                onChange={onChange}
              />
              <span className="bg-token-search absolute left-[18px] top-0 bottom-0 w-[14px] bg-no-repeat bg-center bg-contain "></span>
            </label>
            {searchResults?.length > 0 && (
              <div className="z-50 relative">
                <div className="text-xs rounded-b-md -mr-2 ml-2 -mt-1 bg-white py-2 shadow">
                  {searchResults.map((token) => (
                    <div
                      key={token.contract}
                      className="mx-2 px-2 py-2 hover:bg-gray-100 cursor-pointer hover:border-gray-500 truncate"
                    >
                      <a href={`/token/${token.contract}`}>
                        <a className="flex items-center my-1 whitespace-nowrap ">
                          <div className="flex-shrink-0 h-5 w-5 mr-2">
                            <TokenImage
                              src={token?.icon}
                              alt={token?.name}
                              appUrl={config.appUrl}
                              className="w-5 h-5"
                            />
                          </div>
                          <p className="font-semibold text-sm truncate">
                            {token.name}
                            <span className="text-gray-400 ml-2">
                              {token.symbol}
                            </span>
                          </p>
                        </a>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Widget
        src={`${config.ownerId}/widget/bos-components.components.Shared.Table`}
        props={{
          columns: columns,
          data: tokens,
          isLoading: isLoading,
          isPagination: true,
          count: totalCount,
          page: currentPage,
          limit: 25,
          pageLimit: 200,
          setPage: setPage,
        }}
      />
    </>
  );
}
