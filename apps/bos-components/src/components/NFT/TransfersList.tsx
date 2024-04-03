/**
 * Component: NFTTransfersList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Non-Fungible Token Transfers List on Near Protocol.
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
  t: (key: string, options?: { count?: string | undefined }) => string;
  currentPage: number;
  setPage: (page: number) => void;
}

import Skeleton from '@/includes/Common/Skeleton';
import TxnStatus from '@/includes/Common/Status';
import Clock from '@/includes/icons/Clock';
import TokenImage from '@/includes/icons/TokenImage';
import { Status, TransactionInfo } from '@/includes/types';
import FaLongArrowAltRight from '@/includes/icons/FaLongArrowAltRight';

export default function ({ network, t, currentPage, setPage, ownerId }: Props) {
  const { formatTimestampToString, getTimeAgoString, localFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit, nanoToMilli } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showAge, setShowAge] = useState(true);
  const errorMessage = t ? t('txns:noTxns') : 'No transactions found!';
  const [tokens, setTokens] = useState<{ [key: number]: TransactionInfo[] }>(
    {},
  );
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState({
    height: 0,
    sync: true,
  });
  const [timestamp, setTimeStamp] = useState('');
  const config = getConfig && getConfig(network);

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };
  useEffect(() => {
    function fetchTotalTokens() {
      asyncFetch(`${config?.backendUrl}nfts/txns/count`, {
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
              handleRateLimit(data, fetchTotalTokens);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTokens(page: number) {
      setIsLoading(true);
      asyncFetch(`${config?.backendUrl}nfts/txns?page=${page}&per_page=25`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              txns: TransactionInfo[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns;
            if (data.status === 200) {
              setTokens((prevData) => ({ ...prevData, [page]: resp || [] }));
              setIsLoading(false);
            } else {
              handleRateLimit(
                data,
                () => fetchTokens(page),
                () => setIsLoading(false),
              );
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }
    function fetchStatus() {
      asyncFetch(`${config.backendUrl}sync/status`)
        .then(
          (data: {
            body: {
              status: Status;
            };
            status: number;
          }) => {
            const resp = data?.body?.status?.indexers.events;
            if (data.status === 200) {
              setStatus(resp);
            } else {
              handleRateLimit(data, fetchStatus);
            }
          },
        )
        .catch(() => {});
    }
    if (config?.backendUrl) {
      fetchTotalTokens();
      fetchTokens(currentPage);
      fetchStatus();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, currentPage]);
  useEffect(() => {
    function fetchTimeStamp(height: number) {
      asyncFetch(`${config?.rpcUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'block',
          params: {
            block_id: height,
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (res: {
            body: {
              result: any;
            };
          }) => {
            const resp = res?.body?.result.header;
            setTimeStamp(resp.timestamp_nanosec);
          },
        )
        .catch(() => {});
    }
    if (config?.rpcUrl && status.height) {
      fetchTimeStamp(status.height);
    }
  }, [status.height, config?.rpcUrl]);
  const toggleShowAge = () => setShowAge((s) => !s);

  const columns = [
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus status={row?.outcomes?.status} showLabel={false} />
        </>
      ),
      tdClassName: 'pl-5 py-2 whitespace-nowrap text-sm text-nearblue-600',
    },
    {
      header: <span>{t ? t('hash') : 'HASH'}</span>,
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
      tdClassName: 'px-5 py-2 text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span> {t ? t('type') : 'TYPE'}</span>,
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
      tdClassName: 'px-5 py-2 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>From</span>,
      key: 'affected_account_id',
      cell: (row: TransactionInfo) => {
        return Number(row.delta_amount) < 0 ? (
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
        ) : (
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
        );
      },
      tdClassName:
        'px-5 py-2 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => {
        return row.affected_account_id === row.involved_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
            {t('txnSelf')}
          </span>
        ) : (
          <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
            <FaLongArrowAltRight />
          </div>
        );
      },
      tdClassName: 'text-center',
    },
    {
      header: <span>To</span>,
      key: 'involved_account_id',
      cell: (row: TransactionInfo) => {
        return Number(row.delta_amount) < 0 ? (
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
        ) : (
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
        );
      },
      tdClassName: 'px-5 py-2 text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>Token ID</span>,
      key: 'block_height',
      cell: (row: TransactionInfo) => (
        <div className="whitespace-nowrap text-sm text-nearblue-600 max-w-[110px] inline-block truncate">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  <Link
                    href={`/nft-token/${row?.nft?.contract}/${row?.token_id}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 font-medium hover:no-underline">
                      {row?.token_id}
                    </a>
                  </Link>
                </span>
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
        </div>
      ),
      tdClassName: 'px-5 py-2',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: <span>Token</span>,
      key: 'block_height',
      cell: (row: TransactionInfo) => {
        return (
          row?.nft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  src={row?.nft?.icon}
                  alt={row?.nft?.name}
                  className="w-4 h-4"
                  appUrl={config.appUrl}
                />
              </span>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="text-sm text-nearblue-600 max-w-[110px] inline-block truncate">
                      <Link
                        href={`/nft-token/${row?.nft?.contract}`}
                        className="hover:no-underline"
                      >
                        <a className="text-green-500 font-medium hover:no-underline">
                          {row?.nft?.name}
                        </a>
                      </Link>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                    align="start"
                    side="bottom"
                  >
                    {row?.nft?.name}
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
              {row?.nft?.symbol && (
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="text-sm text-nearblue-700 max-w-[80px] inline-block truncate">
                        &nbsp; {row?.nft?.symbol}
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                      align="start"
                      side="bottom"
                    >
                      {row?.nft?.symbol}
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}
            </div>
          )
        );
      },
      tdClassName:
        'px-5 py-2 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: (
        <div className="w-full inline-flex px-5 py-4">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={toggleShowAge}
                  className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 focus:outline-none whitespace-nowrap"
                >
                  {showAge ? 'AGE' : 'DATE TIME (UTC)'}
                  {showAge && <Clock className="text-green-500 ml-2" />}
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
      tdClassName: 'px-5 py-2 whitespace-nowrap text-sm text-nearblue-600',
      thClassName: 'inline-flex whitespace-nowrap',
    },
  ];

  return (
    <>
      <div className="bg-white border soft-shadow rounded-xl pb-1">
        {isLoading ? (
          <div className="max-w-lg w-full pl-3 py-5">
            <Skeleton className="h-4" />
          </div>
        ) : (
          <>
            {!status.sync && (
              <div className="flex w-full justify-center bg-nearblue rounded-t-xl px-5 py-4 text-green text-sm">
                Non-Fungible token transfers are out of sync. Last synced block
                was
                <span className="font-bold mx-0.5">
                  {localFormat && localFormat(status.height)}
                </span>
                {`(${timestamp && getTimeAgoString(nanoToMilli(timestamp))}).`}
                Non-Fungible token transfers data will be delayed.
              </div>
            )}
            <div className={`flex flex-col lg:flex-row pt-4`}>
              <div className="flex flex-col">
                <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600">
                  A total of {localFormat && localFormat(totalCount.toString())}{' '}
                  transactions found
                </p>
              </div>
            </div>
          </>
        )}
        <Widget
          src={`${ownerId}/widget/bos-components.components.Shared.Table`}
          props={{
            columns: columns,
            data: tokens[currentPage],
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
      </div>
    </>
  );
}
