/**
 * Component: NFTTokenTransfers
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Non-Fungible Token Transfers on Near Protocol.
 * @interface Props
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [id] - The token identifier passed as a string
 * @param {string} [tid] - The Non-Fungible token identifier passed as a string
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 */

import Skeleton from '@/includes/Common/Skeleton';
import TxnStatus from '@/includes/Common/Status';
import {
  formatTimestampToString,
  getTimeAgoString,
  localFormat,
} from '@/includes/formats';
import Clock from '@/includes/icons/Clock';
import FaLongArrowAltRight from '@/includes/icons/FaLongArrowAltRight';
import { getConfig, nanoToMilli } from '@/includes/libs';
import { TransactionInfo } from '@/includes/types';

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  id: string;
  tid: string;
}

export default function ({ network, t, id, tid }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [txns, setTxns] = useState<{ [key: number]: TransactionInfo[] }>({});
  const [showAge, setShowAge] = useState(true);
  const errorMessage = ' No token transfers found!';

  const config = getConfig(network);

  useEffect(() => {
    function fetchTotalTokens() {
      asyncFetch(`${config?.backendUrl}nfts/${id}/tokens/${tid}/txns/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              txns: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns?.[0];
            if (data.status === 200) {
              setTotalCount(resp?.count | 0);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTokens(page: number) {
      setIsLoading(true);
      asyncFetch(
        `${config?.backendUrl}nfts/${id}/tokens/${tid}/txns?page=${currentPage}&per_page=25`,
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
              txns: TransactionInfo[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns;
            if (data.status === 200) {
              setTxns((prevData) => ({ ...prevData, [page]: resp || [] }));
            }
          },
        )
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }

    fetchTotalTokens();
    fetchTokens(currentPage);
  }, [config?.backendUrl, currentPage, id, tid]);

  const toggleShowAge = () => setShowAge((s) => !s);

  const columns = [
    {
      header: '',
      key: 'status',
      cell: (row: TransactionInfo) => (
        <span>
          <TxnStatus status={row.outcomes.status} showLabel={false} />
        </span>
      ),
      tdClassName:
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-nearblue-600 flex justify-end',
    },
    {
      header: <span>Txn Hash</span>,
      key: 'hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                  <a
                    href={`/txns/${row.transaction_hash}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 font-medium hover:no-underline">
                      {row.transaction_hash}
                    </a>
                  </a>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
                side="bottom"
              >
                {row.transaction_hash}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>METHOD</span>,
      key: 'type',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="bg-blue-900/10 text-xs text-nearblue-600 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
                  <span className="block truncate">{row.event_kind}</span>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
                side="bottom"
              >
                {row.event_kind}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>{t ? t('from') : 'FROM'}</span>,
      key: 'from',
      cell: (row: TransactionInfo) => (
        <span>
          {row.token_old_owner_account_id ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                    <a
                      href={`/address/${row.token_old_owner_account_id}`}
                      className="hover:no-underline"
                    >
                      <a className="text-green-500 hover:no-underline">
                        {row.token_old_owner_account_id}
                      </a>
                    </a>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  align="center"
                  side="bottom"
                >
                  {row.token_old_owner_account_id}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            'system'
          )}
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },

    {
      header: '',
      key: '',
      cell: (row: TransactionInfo) => (
        <span>
          {row.token_old_owner_account_id === row.token_new_owner_account_id ? (
            <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
              Self
            </span>
          ) : (
            <span className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
              <FaLongArrowAltRight />
            </span>
          )}
        </span>
      ),
      tdClassName: 'text-center',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },

    {
      header: <span>{t ? t('to') : 'TO'}</span>,
      key: 'change_24',
      cell: (row: TransactionInfo) => (
        <span>
          {row.token_new_owner_account_id ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                    <a
                      href={`/address/${row.token_new_owner_account_id}`}
                      className="hover:no-underline"
                    >
                      <a className="text-green-500 hover:no-underline">
                        {row.token_new_owner_account_id}
                      </a>
                    </a>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  align="center"
                  side="bottom"
                >
                  {row.token_new_owner_account_id}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            'system'
          )}
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>BLOCK</span>,
      key: 'block_hash',
      cell: (row: TransactionInfo) => (
        <span>
          <a
            href={`/blocks/${row.included_in_block_hash}`}
            className="hover:no-underline"
          >
            <a className="text-green-500 hover:no-underline">
              {localFormat(row.block.block_height)}
            </a>
          </a>
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider h-[57px]',
    },
    {
      header: (
        <div>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={toggleShowAge}
                  className="w-full flex items-center px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex-row"
                >
                  {showAge ? (
                    <>
                      AGE
                      <Clock className="text-green-500 ml-2" />
                    </>
                  ) : (
                    'DATE TIME (UTC)'
                  )}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
                side="top"
              >
                {showAge
                  ? 'Click to show Datetime Format'
                  : 'Click to show Age Format'}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      ),
      key: 'block_timestamp',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  {!showAge
                    ? formatTimestampToString(nanoToMilli(row.block_timestamp))
                    : getTimeAgoString(nanoToMilli(row.block_timestamp))}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
                align="center"
                side="bottom"
              >
                {showAge
                  ? formatTimestampToString(nanoToMilli(row.block_timestamp))
                  : getTimeAgoString(nanoToMilli(row.block_timestamp))}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
    },
  ];

  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  return (
    <>
      {isLoading ? (
        <div className="max-w-lg w-full pl-3 py-5">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600">
              A total of {localFormat(totalCount)} transactions found
            </p>
          </div>
        </div>
      )}
      <Widget
        src={`${config.ownerId}/widget/bos-components.components.Shared.Table`}
        props={{
          columns: columns,
          data: txns[currentPage],
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
