/**
 * Component: BlocksList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Table of blocks on Near Protocol.
 * @interface Props
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

import Skeleton from '@/includes/Common/Skeleton';
import Clock from '@/includes/icons/Clock';
import { BlocksInfo } from '@/includes/types';

interface Props {
  ownerId: string;
  network: string;
  t: (
    key: string,
    options?: { from: string; to: string; count: string },
  ) => string | undefined;
  currentPage: number;
  setPage: (page: number) => void;
}

export default function ({ currentPage, setPage, t, network, ownerId }: Props) {
  const {
    convertToMetricPrefix,
    formatTimestampToString,
    gasFee,
    getTimeAgoString,
    localFormat,
  } = VM.require(`${ownerId}/widget/includes.Utils.formats`);

  const { getConfig, handleRateLimit, nanoToMilli, shortenAddress } =
    VM.require(`${ownerId}/widget/includes.Utils.libs`);

  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showAge, setShowAge] = useState(true);
  const [blocks, setBlocks] = useState<{ [key: number]: BlocksInfo[] }>({});
  const errorMessage = t ? t('blocks:noBlocks') : 'No blocks!';
  const [address, setAddress] = useState('');

  const config = getConfig && getConfig(network);

  useEffect(() => {
    function fetchTotalBlocks() {
      asyncFetch(`${config?.backendUrl}blocks/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              blocks: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.blocks?.[0];
            if (data.status === 200) {
              setTotalCount(resp?.count ?? 0);
            } else {
              handleRateLimit(data, fetchTotalBlocks);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchBlocks(page: number) {
      setIsLoading(true);
      asyncFetch(`${config?.backendUrl}blocks?page=${page}&per_page=25`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              blocks: BlocksInfo[];
            };
            status: number;
          }) => {
            const resp = data?.body?.blocks;
            if (data.status === 200) {
              setBlocks((prevData) => ({ ...prevData, [page]: resp || [] }));
              setIsLoading(false);
            } else {
              handleRateLimit(
                data,
                () => fetchBlocks(page),
                () => setIsLoading(false),
              );
            }
          },
        )
        .catch(() => {});
    }
    if (config?.backendUrl) {
      fetchTotalBlocks();
      fetchBlocks(currentPage);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, currentPage]);

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };

  const start = blocks[currentPage]?.[0];
  const end = blocks[currentPage]?.[blocks[currentPage]?.length - 1];
  const toggleShowAge = () => setShowAge((s) => !s);

  const columns = [
    {
      header: <span>{t ? t('blocks:blocks') : 'BLOCK'}</span>,
      key: 'block_hash',
      cell: (row: BlocksInfo) => (
        <span>
          <Link
            href={`/blocks/${row?.block_hash}`}
            className="hover:no-underline"
          >
            <a className="text-green-500 dark:text-green-250 hover:no-underline">
              {row?.block_height
                ? localFormat(row?.block_height)
                : row?.block_height ?? ''}
            </a>
          </Link>
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600  dark:text-neargray-10 font-medium',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
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
                  className="w-full flex items-center px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex-row"
                >
                  {showAge ? (
                    <>
                      {t ? t('blocks:age') : 'AGE'}
                      <Clock className="text-green-500 dark:text-green-250 ml-2" />
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
      cell: (row: BlocksInfo) => (
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
                align="center"
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
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <span>{t ? t('blocks:txn') : 'TXN'}</span>,
      key: 'count',
      cell: (row: BlocksInfo) => (
        <span>
          {row?.transactions_agg?.count
            ? localFormat(row?.transactions_agg?.count)
            : row?.transactions_agg?.count ?? ''}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('blocks:block.receipt') : 'RECEIPT'}</span>,
      key: 'count',
      cell: (row: BlocksInfo) => (
        <span>
          {row?.receipts_agg?.count
            ? localFormat(row?.receipts_agg?.count)
            : row?.receipts_agg?.count ?? ''}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('blocks:miner') : 'AUTHOR'}</span>,
      key: 'author_account_id',
      cell: (row: BlocksInfo) => (
        <span>
          <Link
            href={`/address/${row?.author_account_id}`}
            className={`hover:no-underline`}
          >
            <a
              className={`text-green-500 dark:text-green-250 hover:no-underline ${
                row?.author_account_id === address
                  ? ' rounded-md bg-[#FFC10740] border-[#FFC10740] border border-dashed p-1 -m-[1px] cursor-pointer text-[#033F40]'
                  : 'text-green-500 dark:text-green-250 p-1'
              }`}
              onMouseOver={(e) => onHandleMouseOver(e, row?.author_account_id)}
              onMouseLeave={handleMouseLeave}
            >
              {shortenAddress(row?.author_account_id ?? '')}
            </a>
          </Link>
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('blocks:block.gasUsed') : 'GAS USED'}</span>,
      key: 'gas_used',
      cell: (row: BlocksInfo) => (
        <span>
          {row?.chunks_agg?.gas_used !== null
            ? convertToMetricPrefix(row?.chunks_agg?.gas_used) + 'gas'
            : ''}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('blocks:block.gasLimit') : 'GAS LIMIT'}</span>,
      key: 'gas_limit',
      cell: (row: BlocksInfo) => (
        <span>{convertToMetricPrefix(row?.chunks_agg?.gas_limit ?? 0)}gas</span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('blocks:block.gasFee') : 'GAS FEE'}</span>,
      key: 'gas_price',
      cell: (row: BlocksInfo) => (
        <span>
          {row?.chunks_agg?.gas_used
            ? gasFee(row?.chunks_agg?.gas_used, row?.gas_price)
            : row?.chunks_agg?.gas_used ?? ''}
          Ⓝ
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
  ];

  return (
    <div className="bg-white dark:bg-black-600 drak:border-black-200 border soft-shadow rounded-xl pb-1 ">
      {isLoading ? (
        <div className="pl-6 max-w-lg w-full py-5 ">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <p className="leading-7 pl-6 text-sm py-4 text-nearblue-600 dark:text-neargray-10">
          {t
            ? t('blocks:listing', {
                from: start?.block_height
                  ? localFormat && localFormat(start?.block_height)
                  : start?.block_height ?? '',
                to: end?.block_height
                  ? localFormat && localFormat(end?.block_height)
                  : end?.block_height ?? '',
                count: localFormat && localFormat(totalCount.toString()),
              })
            : `Block #${
                start?.block_height
                  ? localFormat && localFormat(start?.block_height)
                  : start?.block_height ?? ''
              } to ${
                '#' + end?.block_height
                  ? localFormat && localFormat(end?.block_height)
                  : end?.block_height ?? ''
              } (Total of ${
                localFormat && localFormat(totalCount.toString())
              } blocks)`}{' '}
        </p>
      )}
      {
        <Widget
          src={`${ownerId}/widget/bos-components.components.Shared.Table`}
          props={{
            columns: columns,
            data: blocks[currentPage],
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
      }
    </div>
  );
}
