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
  ownerID: string;
  network: string;
  id: string;
}

import Skeleton from '@/includes/Common/Skeleton';
import TxnStatus from '@/includes/Common/Status';
import Clock from '@/includes/icons/Clock';
import { TransactionInfo } from '@/includes/types';
import FaLongArrowAltRight from '@/includes/icons/FaLongArrowAltRight';

export default function ({ network, id, ownerID }: Props) {
  const { formatTimestampToString, getTimeAgoString, localFormat } = VM.require(
    `${ownerID}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit, nanoToMilli } = VM.require(
    `${ownerID}/widget/includes.Utils.libs`,
  );

  const [isLoading, setIsLoading] = useState(false);
  const initialPage = 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [txns, setTxns] = useState<{ [key: number]: TransactionInfo[] }>({});

  const config = getConfig && getConfig(network);

  const [showAge, setShowAge] = useState(true);
  const errorMessage = 'No transactions found!';
  const [address, setAddress] = useState('');

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
              setTotalCount(resp?.count ?? 0);
            } else {
              handleRateLimit(data, fetchTotalTxns);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTxnsData(page: number) {
      setIsLoading(true);

      asyncFetch(
        `${config?.backendUrl}nfts/${id}/txns?order=desc&page=${page}&per_page=25`,
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
            setTxns((prevData) => ({ ...prevData, [page]: resp || [] }));
            setIsLoading(false);
          } else {
            handleRateLimit(
              data,
              () => fetchTxnsData(page),
              () => setIsLoading(false),
            );
          }
        })
        .catch(() => {});
    }

    fetchTotalTxns();
    fetchTxnsData(currentPage);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, currentPage, id]);

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };
  const columns = [
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus status={row?.outcomes?.status} showLabel={false} />
        </>
      ),
      tdClassName:
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-nearblue-600 flex justify-end',
    },
    {
      header: <span>TXN HASH</span>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 whitespace-nowrap">
                  <Link
                    href={`/txns/${row?.transaction_hash}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 font-medium hover:no-underline">
                      {row?.transaction_hash}
                    </a>
                  </Link>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
                align="start"
                side="bottom"
              >
                {row?.transaction_hash}
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
      header: <span>METHOD</span>,
      key: 'cause',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="bg-blue-900/10 text-xs text-nearblue-600 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
                  <span className="block truncate">{row?.cause}</span>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
                side="bottom"
              >
                {row?.cause}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>Affected</span>,
      key: 'affected_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          {row?.affected_account_id ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span
                    className={`truncate max-w-[120px] inline-block align-bottom text-green-500 whitespace-nowrap ${
                      row?.affected_account_id === address
                        ? ' rounded-md bg-[#FFC10740] border-[#FFC10740] border border-dashed p-0.5 px-1 -m-[1px] cursor-pointer text-[#033F40]'
                        : 'text-green-500 p-0.5 px-1'
                    }`}
                  >
                    <Link
                      href={`/address/${row?.affected_account_id}`}
                      className="hover:no-underline"
                    >
                      <a
                        className="text-green-500 hover:no-underline"
                        onMouseOver={(e) =>
                          onHandleMouseOver(e, row?.affected_account_id)
                        }
                        onMouseLeave={handleMouseLeave}
                      >
                        {row?.affected_account_id}
                      </a>
                    </Link>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  align="start"
                  side="bottom"
                >
                  {row?.affected_account_id}
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
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => {
        return row.affected_account_id === row.involved_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
            SELF
          </span>
        ) : Number(row?.delta_amount) > 0 ? (
          <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white rotate-180">
            <FaLongArrowAltRight />
          </div>
        ) : (
          <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
            <FaLongArrowAltRight />
          </div>
        );
      },
      tdClassName: 'text-center',
    },
    {
      header: <span>Involved</span>,
      key: 'involved_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          {row?.involved_account_id ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span
                    className={`truncate max-w-[120px] inline-block align-bottom text-green-500 whitespace-nowrap ${
                      row?.involved_account_id === address
                        ? ' rounded-md bg-[#FFC10740] border-[#FFC10740] border border-dashed p-0.5 px-1 -m-[1px] cursor-pointer text-[#033F40]'
                        : 'text-green-500 p-0.5 px-1'
                    }`}
                  >
                    <Link
                      href={`/address/${row?.involved_account_id}`}
                      className="hover:no-underline"
                    >
                      <a
                        className="text-green-500 hover:no-underline"
                        onMouseOver={(e) =>
                          onHandleMouseOver(e, row?.involved_account_id)
                        }
                        onMouseLeave={handleMouseLeave}
                      >
                        {row?.involved_account_id}
                      </a>
                    </Link>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  align="start"
                  side="bottom"
                >
                  {row?.involved_account_id}
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
      header: <span>TOKEN ID</span>,
      key: 'token_id',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>{row?.token_id}</span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {row?.token_id}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600 max-w-[110px] inline-block truncate',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: (
        <>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={toggleShowAge}
                  className="text-left text-xs px-5 py-4 w-full flex items-center font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex-row whitespace-nowrap"
                >
                  {showAge ? (
                    <>
                      {'AGE'}
                      <Clock className="text-green-500 ml-2" />
                    </>
                  ) : (
                    <> {'DATE TIME (UTC)'}</>
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
        </>
      ),
      key: 'block_timestamp',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  {!showAge
                    ? row?.block_timestamp
                      ? formatTimestampToString(
                          nanoToMilli(row?.block_timestamp),
                        )
                      : ''
                    : row?.block_timestamp
                    ? getTimeAgoString(nanoToMilli(row?.block_timestamp))
                    : ''}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {showAge
                  ? row?.block_timestamp
                    ? formatTimestampToString(nanoToMilli(row?.block_timestamp))
                    : ''
                  : row?.block_timestamp
                  ? getTimeAgoString(nanoToMilli(row?.block_timestamp))
                  : ''}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName: 'inline-flex',
    },
    {
      header: <span> DETAILS</span>,
      key: 'contract',
      cell: (row: TransactionInfo) => (
        <span>
          <Link
            href={`/nft-token/${row?.nft?.contract}/${row?.token_id}`}
            className="hover:no-underline"
          >
            <a className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded hover:no-underline">
              View NFT &gt;
            </a>
          </Link>
        </span>
      ),
      tdClassName:
        'pr-5 py-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
  ];

  return (
    <>
      {isLoading ? (
        <div className="pl-6 max-w-lg w-full py-5 ">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600">
              A total of {localFormat && localFormat(totalCount.toString())}{' '}
              transactions found
            </p>
          </div>
        </div>
      )}
      <Widget
        src={`${ownerID}/widget/bos-components.components.Shared.Table`}
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
