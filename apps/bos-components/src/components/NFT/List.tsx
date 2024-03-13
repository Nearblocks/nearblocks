/**
 * Component: NFTList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Top Non-Fungible Tokens on Near Protocol.
 * @interface Props
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 * @param {React.FC<{
 *   href: string;
 *   children: React.ReactNode;
 *   className?: string;
 * }>} Link - A React component for rendering links.
 */
interface Props {
  network: string;
  t: (key: string) => string | undefined;
  currentPage: number;
  setPage: (page: number) => void;
  Link: React.FC<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>;
}

import { localFormat, serialNumber } from '@/includes/formats';
import { debounce, getConfig, handleRateLimit } from '@/includes/libs';
import TokenImage from '@/includes/icons/TokenImage';
import { Sorting, Token } from '@/includes/types';
import Skeleton from '@/includes/Common/Skeleton';
import SortIcon from '@/includes/icons/SortIcon';

const initialSorting: Sorting = {
  sort: 'txns_day',
  order: 'desc',
};

const initialPagination = {
  per_page: 50,
};

export default function ({ network, currentPage, setPage, t, Link }: Props) {
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [tokens, setTokens] = useState<{ [key: number]: Token[] }>({});
  const [sorting, setSorting] = useState<Sorting>(initialSorting);
  const errorMessage = t ? t('token:fts.top.empty') : 'No tokens found!';
  const config = getConfig(network);

  useEffect(() => {
    function fetchTotalTokens(qs?: string) {
      const queryParams = qs ? '?' + qs : '';
      asyncFetch(`${config?.backendUrl}nfts/count${queryParams}`, {
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
        `${config?.backendUrl}nfts?${queryParams}order=${sqs?.order}&sort=${sqs?.sort}&page=${currentPage}&per_page=${initialPagination.per_page}`,
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
        .catch(() => {})
        .finally(() => {});
    }

    fetchTotalTokens();
    fetchTokens('', sorting, currentPage);
    if (sorting) {
      fetchTotalTokens();
      fetchTokens('', sorting, currentPage);
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
        'pl-6 py-4 whitespace-nowrap text-sm text-nearblue-700 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider w-[1px]',
    },
    {
      header: <span>Token</span>,
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
              href={`/nft-token/${row?.contract}`}
              className="hover:no-underline"
            >
              <a className="flex text-green-500 hover:no-underline">
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
        'px-6 py-4 whitespace-nowrap text-sm  text-nearblue-600 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>Tokens</span>,
      key: 'tokens',
      cell: (row: Token) => (
        <span>
          {row?.tokens ? localFormat(row?.tokens) : row?.tokens ?? ''}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider w-[160px]',
    },
    {
      header: <span>Holders</span>,
      key: 'holders',
      cell: (row: Token) => (
        <span>{row?.holders ? localFormat(row?.holders) : ''}</span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider w-[160px]',
    },
    {
      header: (
        <span>
          <button
            type="button"
            onClick={() => onOrder('txns_day')}
            className="w-full px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex flex-row whitespace-nowrap"
          >
            {sorting.sort === 'txns_day' && (
              <div className="text-nearblue-600 font-semibold">
                <SortIcon order={sorting.order} />
              </div>
            )}
            Transfers (24H)
          </button>
        </span>
      ),
      key: 'change_24',
      cell: (row: Token) => (
        <span>{row?.transfers_day ? localFormat(row?.transfers_day) : ''}</span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 align-top',
      thClassName: 'w-[160px]',
    },
  ];

  const debouncedSearch = useMemo(() => {
    return debounce(500, (value: string) => {
      if (!value || value?.trim() === '') {
        setSearchResults([]);
        return;
      }
      asyncFetch(`${config?.backendUrl}nfts?search=${value}&per_page=5`, {
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
      <div className=" bg-white border soft-shadow rounded-xl pb-1 ">
        <div className="flex flex-row items-center justify-between text-left text-sm text-nearblue-600 px-3 py-2">
          {isLoading ? (
            <Skeleton className="max-w-lg pl-3" />
          ) : (
            <p className="pl-3">
              A total of {localFormat(totalCount.toString())} NEP-171 Token
              Contracts found
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
                        <Link href={`/token/${token?.contract}`}>
                          <a className="flex items-center my-1 whitespace-nowrap ">
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
          src={`${config?.ownerId}/widget/bos-components.components.Shared.Table`}
          props={{
            columns: columns,
            data: tokens[currentPage],
            isLoading: isLoading,
            isPagination: true,
            count: totalCount,
            page: currentPage,
            limit: initialPagination.per_page,
            pageLimit: 200,
            setPage: setPage,
            Error: errorMessage,
          }}
        />
      </div>
    </>
  );
}
