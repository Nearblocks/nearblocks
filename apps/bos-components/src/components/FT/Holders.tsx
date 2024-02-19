/**
 * Component: FTHolders
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Fungible Token Holders List.
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

import Skeleton from '@/includes/Common/Skeleton';
import { localFormat, serialNumber } from '@/includes/formats';
import { getConfig } from '@/includes/libs';
import { price, tokenAmount, tokenPercentage } from '@/includes/near';
import { HoldersPropsInfo, Token } from '@/includes/types';

export default function ({ network, id, token }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const initialPage = 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [holder, setHolder] = useState<{ [key: number]: HoldersPropsInfo[] }>(
    {},
  );
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
    function fetchTotalHolders() {
      asyncFetch(`${config?.backendUrl}fts/${id}/holders/count`, {
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
              setTotalCount(resp?.count);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchHoldersData(page: number) {
      setIsLoading(true);

      asyncFetch(
        `${config?.backendUrl}fts/${id}/holders?page=${currentPage}&per_page=25`,
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
              setHolder((prevData) => ({ ...prevData, [page]: resp || [] }));
            }
          },
        )
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }
    if (!token && token === undefined) {
      fetchFTData();
    }
    fetchTotalHolders();
    fetchHoldersData(currentPage);
  }, [config?.backendUrl, currentPage, id, token]);

  useEffect(() => {
    if (token) {
      setTokens(token);
    }
  }, [token]);

  const columns = [
    {
      header: 'Rank',
      key: '',
      cell: (_row: HoldersPropsInfo, index: number) => (
        <span>{serialNumber(index, currentPage, 25)}</span>
      ),
      tdClassName:
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-nearblue-600 w-[50px]',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider w-[50]',
    },
    {
      header: 'Address',
      key: 'account',
      cell: (row: HoldersPropsInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[200px] inline-block align-bottom text-green-500 whitespace-nowrap">
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
      tdClassName: 'px-5 py-4 text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: 'Quantity',
      key: '',
      cell: (row: HoldersPropsInfo) => (
        <>
          {' '}
          {row.amount && tokens?.decimals
            ? tokenAmount(row.amount, tokens?.decimals, true)
            : ''}
        </>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: 'Percentage',
      key: 'total_supply',
      cell: (row: HoldersPropsInfo) => {
        const percentage = token?.total_supply
          ? tokenPercentage(token.total_supply, row.amount, token.decimals)
          : null;
        return (
          <>
            {percentage === null ? 'N/A' : `${percentage}%`}
            {percentage !== null && percentage <= 100 && percentage >= 0 && (
              <div className="h-0.5 mt-1 w-full bg-gray-100">
                <div
                  style={{ width: `${percentage}%` }}
                  className="h-0.5 bg-green-500"
                />
              </div>
            )}
          </>
        );
      },
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: 'Value',
      key: 'tokens',
      cell: (row: HoldersPropsInfo) => {
        return (
          <span>
            {row.amount && tokens?.decimals && tokens?.price
              ? '$' + price(row.amount, tokens?.decimals, tokens?.price)
              : ''}
          </span>
        );
      },
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'x-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
  ];

  return (
    <>
      {isLoading ? (
        <div className="pl-3 max-w-sm py-5 h-[60px]">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600">
              A total of {localFormat(totalCount.toString())} transactions found
            </p>
          </div>
        </div>
      )}
      <Widget
        src={`${config.ownerId}/widget/bos-components.components.Shared.Table`}
        props={{
          columns: columns,
          data: holder[currentPage],
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
