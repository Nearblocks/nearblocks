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
 * @param {string} ownerId - The identifier of the owner of the component.
 */

import Skeleton from '@/includes/Common/Skeleton';
import TxnStatus from '@/includes/Common/Status';
import Clock from '@/includes/icons/Clock';
import { TransactionInfo } from '@/includes/types';
import FaLongArrowAltRight from '@/includes/icons/FaLongArrowAltRight';
import ErrorMessage from '@/includes/Common/ErrorMessage';
import FaInbox from '@/includes/icons/FaInbox';

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string | undefined;
  id: string;
  tid: string;
}

export default function ({ network, t, id, tid, ownerId }: Props) {
  const { formatTimestampToString, getTimeAgoString, localFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit, nanoToMilli, truncateString } =
    VM.require(`${ownerId}/widget/includes.Utils.libs`);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [txns, setTxns] = useState<TransactionInfo[] | undefined>(undefined);
  const [showAge, setShowAge] = useState(true);
  const errorMessage = ' No token transfers found!';
  const [address, setAddress] = useState('');

  const config = getConfig && getConfig(network);

  const apiUrl = `nfts/${id}/tokens/${tid}/txns?`;

  const [url, setUrl] = useState(apiUrl);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

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
              setTotalCount(resp?.count ?? 0);
            } else {
              handleRateLimit(data, fetchTotalTokens);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTokens() {
      setIsLoading(true);
      asyncFetch(`${config?.backendUrl}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              txns: TransactionInfo[];
              cursor: string | undefined;
            };
            status: number;
          }) => {
            const resp = data?.body?.txns;
            let cursor = data?.body?.cursor;
            if (data.status === 200) {
              setCursor(cursor);
              if (Array.isArray(resp) && resp.length > 0) {
                setTxns(resp);
              } else if (resp.length === 0) {
                setTxns(undefined);
              }
              setIsLoading(false);
            } else {
              handleRateLimit(
                data,
                () => fetchTokens(),
                () => setIsLoading(false),
              );
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }
    if (config?.backendUrl) {
      fetchTotalTokens();
      fetchTokens();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, id, tid, url]);

  const toggleShowAge = () => setShowAge((s) => !s);

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };

  const columns = [
    {
      header: '',
      key: 'status',
      cell: (row: TransactionInfo) => (
        <span>
          <TxnStatus status={row?.outcomes?.status} showLabel={false} />
        </span>
      ),
      tdClassName:
        'pl-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <span>Txn Hash</span>,
      key: 'hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250">
                  <Link
                    href={`/txns/${row?.transaction_hash}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 dark:text-green-250 font-medium hover:no-underline">
                      {row?.transaction_hash}
                    </a>
                  </Link>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
                side="bottom"
              >
                {row?.transaction_hash}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>{t ? t('method') : 'METHOD'}</span>,
      key: 'type',
      cell: (row: TransactionInfo) => (
        <span>
          <OverlayTrigger
            placement="bottom"
            delay={{ show: 500, hide: 0 }}
            overlay={
              <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words">
                {row?.cause}
              </Tooltip>
            }
          >
            <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
              <span className="block truncate">{row?.cause}</span>
            </span>
          </OverlayTrigger>
        </span>
      ),
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
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
                      className={`inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                        row?.affected_account_id === address
                          ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                          : 'text-green-500 dark:text-green-250 border-transparent'
                      }`}
                    >
                      <Link
                        href={`/address/${row?.affected_account_id}`}
                        className="hover:no-underline"
                      >
                        <a
                          className="text-green-500 dark:text-green-250 hover:no-underline"
                          onMouseOver={(e) =>
                            onHandleMouseOver(e, row?.affected_account_id)
                          }
                          onMouseLeave={handleMouseLeave}
                        >
                          {truncateString(row?.affected_account_id, 15, '...')}
                        </a>
                      </Link>
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                    align="center"
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
                      className={`inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md  ${
                        row?.involved_account_id === address
                          ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                          : 'text-green-500 dark:text-green-250 border-transparent'
                      }`}
                    >
                      <Link
                        href={`/address/${row?.involved_account_id}`}
                        className="hover:no-underline"
                      >
                        <a
                          className="text-green-500 dark:text-green-250 hover:no-underline"
                          onMouseOver={(e) =>
                            onHandleMouseOver(e, row?.involved_account_id)
                          }
                          onMouseLeave={handleMouseLeave}
                        >
                          {truncateString(row?.involved_account_id, 15, '...')}
                        </a>
                      </Link>
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                    align="center"
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
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
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
                      className={`inline-block align-bottom text-green-500 dark:text-green-250 p-0.5 px-1 border rounded-md whitespace-nowrap ${
                        row?.involved_account_id === address
                          ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                          : 'text-green-500 dark:text-green-250 border-transparent'
                      }`}
                    >
                      <Link
                        href={`/address/${row?.involved_account_id}`}
                        className="hover:no-underline"
                      >
                        <a
                          className="text-green-500 dark:text-green-250 hover:no-underline"
                          onMouseOver={(e) =>
                            onHandleMouseOver(e, row?.involved_account_id)
                          }
                          onMouseLeave={handleMouseLeave}
                        >
                          {truncateString(row?.involved_account_id, 15, '...')}
                        </a>
                      </Link>
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                    align="center"
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
                      className={`inline-block align-bottom text-green-500 dark:text-green-250 border rounded-md p-0.5 px-1 whitespace-nowrap ${
                        row?.affected_account_id === address
                          ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                          : 'text-green-500 dark:text-green-250 border-transparent'
                      }`}
                    >
                      <Link
                        href={`/address/${row?.affected_account_id}`}
                        className="hover:no-underline"
                      >
                        <a
                          className="text-green-500 dark:text-green-250 hover:no-underline"
                          onMouseOver={(e) =>
                            onHandleMouseOver(e, row?.affected_account_id)
                          }
                          onMouseLeave={handleMouseLeave}
                        >
                          {truncateString(row?.affected_account_id, 15, '...')}
                        </a>
                      </Link>
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                    align="center"
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
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>BLOCK</span>,
      key: 'block_hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Link
            href={`/blocks/${row?.included_in_block_hash}`}
            className="hover:no-underline"
          >
            <a className="text-green-500 dark:text-green-250 hover:no-underline">
              {row?.block?.block_height
                ? localFormat(row?.block?.block_height)
                : row?.block?.block_height ?? ''}
            </a>
          </Link>
        </span>
      ),
      tdClassName:
        'px-6 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider h-[57px]',
    },
    {
      header: (
        <div>
          <OverlayTrigger
            placement="top"
            delay={{ show: 500, hide: 0 }}
            overlay={
              <Tooltip className="fixed h-auto max-w-[8rem] sm:max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words">
                {showAge
                  ? 'Click to show Datetime Format'
                  : 'Click to show Age Format'}
              </Tooltip>
            }
          >
            <button
              type="button"
              onClick={toggleShowAge}
              className="w-full flex items-center px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex-row"
            >
              {showAge ? (
                <>
                  AGE
                  <Clock className="text-green-500 dark:text-green-250 ml-2" />
                </>
              ) : (
                'DATE TIME (UTC)'
              )}
            </button>
          </OverlayTrigger>
        </div>
      ),
      key: 'block_timestamp',
      cell: (row: TransactionInfo) => (
        <span>
          <OverlayTrigger
            placement="bottom"
            delay={{ show: 500, hide: 0 }}
            overlay={
              <Tooltip className="fixed h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2">
                {showAge
                  ? row?.block_timestamp
                    ? formatTimestampToString(nanoToMilli(row?.block_timestamp))
                    : ''
                  : row?.block_timestamp
                  ? getTimeAgoString(nanoToMilli(row?.block_timestamp))
                  : ''}
              </Tooltip>
            }
          >
            <span>
              {!showAge
                ? row?.block_timestamp
                  ? formatTimestampToString(nanoToMilli(row?.block_timestamp))
                  : ''
                : row?.block_timestamp
                ? getTimeAgoString(nanoToMilli(row?.block_timestamp))
                : ''}
            </span>
          </OverlayTrigger>
        </span>
      ),
      tdClassName:
        'px-5 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-48',
    },
  ];

  return (
    <>
      {isLoading ? (
        <div className="max-w-lg w-full pl-3 py-5">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
              {txns &&
                txns.length > 0 &&
                `A total of ${
                  localFormat && localFormat(totalCount.toString())
                }${' '}
              transactions found`}
            </p>
          </div>
        </div>
      )}
      <Widget
        src={`${ownerId}/widget/bos-components.components.Shared.Table`}
        props={{
          columns: columns,
          data: txns,
          isLoading: isLoading,
          count: totalCount,
          limit: 25,
          cursorPagination: true,
          cursor: cursor,
          apiUrl: apiUrl,
          setUrl: setUrl,
          ownerId: ownerId,
          Error: (
            <ErrorMessage
              icons={<FaInbox />}
              message={errorMessage}
              mutedText="Please try again later"
            />
          ),
        }}
      />
    </>
  );
}
