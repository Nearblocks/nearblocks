/**
 * Component: NFTTransfers
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Non-Fungible Token Tranfers List.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {string} [id] - The token identifier passed as a string
 */

interface Props {
  network: string;
  id: string;
}

import TxnStatus from '@/includes/Common/Status';
import {
  formatTimestampToString,
  getTimeAgoString,
  localFormat,
} from '@/includes/formats';
import FaLongArrowAltRight from '@/includes/icons/FaLongArrowAltRight';
import { getConfig, nanoToMilli } from '@/includes/libs';
import { TransactionInfo } from '@/includes/types';

export default function ({ network, id }: Props) {
  const [showAge, setShowAge] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const initialPage = 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [txns, setTxns] = useState<TransactionInfo[]>([]);
  const config = getConfig(network);
  const errorMessage = 'No token transfers found!';

  const toggleShowAge = () => setShowAge((s) => !s);

  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    function fetchTotalTxns() {
      asyncFetch(`${config?.backendUrl}nfts/${id}/txns/count`, {
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
              setTotalCount(resp?.count);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTxnsData() {
      setIsLoading(true);

      asyncFetch(
        `${config?.backendUrl}nfts/${id}/txns?order=desc&page=${currentPage}&per_page=25`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then((data: { body: { txns: TransactionInfo[] }; status: number }) => {
          const resp = data?.body?.txns;
          if (data.status === 200 && Array.isArray(resp) && resp.length > 0) {
            setTxns(resp);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }

    fetchTotalTxns();
    fetchTxnsData();
  }, [config?.backendUrl, currentPage, id]);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 h-5 rounded shadow-sm animate-pulse ${props.className} ${props.wrapperClassName}`}
      ></div>
    );
  };

  const columns = [
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus status={row.outcomes.status} showLabel={false} />
        </>
      ),
      tdClassName:
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-gray-500 flex justify-end',
    },
    {
      header: <span>TXN HASH</span>,
      key: 'transaction_hash',
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
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                align="start"
                side="bottom"
              >
                {row.transaction_hash}
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
      header: <span>METHOD</span>,
      key: 'actions',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="bg-blue-900/10 text-xs text-gray-500 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
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
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span>FROM</span>,
      key: 'signer_account_id',
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
                  align="start"
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
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) =>
        row.token_old_owner_account_id === row.token_new_owner_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
            Self
          </span>
        ) : (
          <span className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
            <FaLongArrowAltRight />
          </span>
        ),
      tdClassName: 'text-center',
    },
    {
      header: <span>TO</span>,
      key: 'receiver_account_id',
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
                  align="start"
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
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span>TOKEN ID</span>,
      key: 'token_id',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>{row.token_id}</span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {row.token_id}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[110px] inline-block truncate',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: (
        <span>
          <div className="w-full inline-flex px-5 py-4">
            <button
              type="button"
              onClick={toggleShowAge}
              className="text-left text-xs w-full font-semibold uppercase tracking-wider text-nearblue-600 focus:outline-none whitespace-nowrap"
            >
              {showAge ? 'AGE' : 'DATE TIME (UTC)'}
            </button>
          </div>
        </span>
      ),
      key: 'block_timestamp',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  {!showAge
                    ? formatTimestampToString(
                        nanoToMilli(Number(row.block_timestamp || 0)),
                      )
                    : getTimeAgoString(
                        nanoToMilli(Number(row.block_timestamp || 0)),
                      )}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {showAge
                  ? formatTimestampToString(
                      nanoToMilli(Number(row.block_timestamp || 0)),
                    )
                  : getTimeAgoString(
                      nanoToMilli(Number(row.block_timestamp || 0)),
                    )}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName: 'inline-flex',
    },
    {
      header: <span> DETAILS</span>,
      key: 'contract',
      cell: (row: TransactionInfo) => (
        <span>
          <a
            href={`/nft-token/${row.nft?.contract}/${row.token_id}`}
            className="hover:no-underline"
          >
            <a className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded hover:no-underline">
              View NFT &gt;
            </a>
          </a>
        </span>
      ),
      tdClassName:
        'pr-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
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
          data: txns,
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
