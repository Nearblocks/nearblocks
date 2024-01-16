/**
 * Component: NFTHolders
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Non-Fungible Token Holders List.
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

import { localFormat, serialNumber } from '@/includes/formats';
import { getConfig, holderPercentage } from '@/includes/libs';
import { HoldersPropsInfo, Token } from '@/includes/types';

export default function ({ network, id, token }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const initialPage = 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [holder, setHolder] = useState<HoldersPropsInfo[]>([]);
  const [tokens, setTokens] = useState<Token>({} as Token);
  const config = getConfig(network);
  const errorMessage = 'No token holders found!';

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
              setTokens(resp);
              setIsLoading(false);
            }
          },
        )
        .catch(() => {});
    }

    function fetchTotalHolders() {
      asyncFetch(`${config?.backendUrl}nfts/${id}/holders/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              holders: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.holders?.[0];
            if (data.status === 200) {
              setTotalCount(0);
              setTotalCount(resp?.count);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchHoldersData() {
      setIsLoading(true);

      asyncFetch(
        `${config?.backendUrl}nfts/${id}/holders?page=${currentPage}&per_page=25`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then(
          (data: { body: { holders: HoldersPropsInfo[] }; status: number }) => {
            const resp = data?.body?.holders;
            if (data.status === 200 && Array.isArray(resp) && resp.length > 0) {
              setHolder(resp);
            }
          },
        )
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }
    if (!token && token === undefined) {
      fetchNFTData();
    }
    fetchTotalHolders();
    fetchHoldersData();
  }, [config?.backendUrl, currentPage, id, token]);

  useEffect(() => {
    if (token) {
      setTokens(token);
    }
  }, [token]);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

  const columns = [
    {
      header: <span>Rank</span>,
      key: '',
      cell: (_row: HoldersPropsInfo, index: number) => (
        <span>{serialNumber(index, currentPage, 25)}</span>
      ),
      tdClassName:
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-gray-500 w-[50px]',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[50px]',
    },
    {
      header: <span> Address</span>,
      key: 'account',
      cell: (row: HoldersPropsInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[200px] inline-block align-bottom text-green-500">
                  <a
                    href={`/address/${row.account}`}
                    className="hover:no-undeline"
                  >
                    <a className="text-green-500 font-medium hover:no-undeline">
                      {row.account}
                    </a>
                  </a>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                align="start"
                side="bottom"
              >
                {row.account}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span>Quantity</span>,
      key: 'quantity',
      cell: (row: HoldersPropsInfo) => <span>{row.quantity}</span>,
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[200px]',
    },
    {
      header: <span> Percentage</span>,
      key: 'tokens',
      cell: (row: HoldersPropsInfo) => {
        const percentage =
          tokens?.tokens > 0
            ? holderPercentage(tokens.tokens, row.quantity)
            : null;
        return (
          <span>
            {percentage === null ? 'N/A' : `${percentage}%`}
            {percentage !== null && percentage <= 100 && percentage >= 0 && (
              <div className="h-0.5 mt-1 w-full bg-gray-100">
                <div
                  style={{ width: `${percentage}%` }}
                  className="h-0.5 bg-green-500"
                />
              </div>
            )}
          </span>
        );
      },
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[300px] ',
    },
  ];

  return (
    <>
      {isLoading ? (
        <Loader
          className="leading-7"
          wrapperClassName="pl-3 max-w-sm py-4 h-[60px]"
        />
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4 border-t`}>
          <div className="flex flex-col">
            <p className="leading-7 px-6 text-sm mb-4 text-gray-500">
              A total of {localFormat(totalCount)} transactions found
            </p>
          </div>
        </div>
      )}
      <Widget
        src={`${config.ownerId}/widget/bos-components.components.Shared.Table`}
        props={{
          columns: columns,
          data: holder,
          isLoading: isLoading,
          isPagination: true,
          count: totalCount,
          page: currentPage,
          limit: 25,
          pageLimit: 200,
          setPage: setPage,
          Error: errorMessage,
        }}
      />
    </>
  );
}
