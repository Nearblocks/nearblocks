/**
 * Component: BlocksList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Table of blocks on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 */

import Skelton from '@/includes/Common/Skelton';
import {
  convertToMetricPrefix,
  formatTimestampToString,
  gasFee,
  getTimeAgoString,
  localFormat,
} from '@/includes/formats';
import { getConfig, nanoToMilli, shortenAddress } from '@/includes/libs';
import { BlocksInfo } from '@/includes/types';

interface Props {
  currentPage: number;
  setPage: (page: number) => void;
}

export default function (props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(1);
  const [blocks, setBlocks] = useState<BlocksInfo[]>([]);
  const [showAge, setShowAge] = useState(true);

  const config = getConfig(context.networkId);

  useEffect(() => {
    function fetchTotalBlocks() {
      setIsLoading(true);
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
          }) => {
            const resp = data?.body?.blocks?.[0];
            setTotalCount(resp?.count);
          },
        )
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }

    function fetchBlocks() {
      setIsLoading(true);
      asyncFetch(
        `${config?.backendUrl}blocks?page=${props.currentPage}&per_page=25`,
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
              blocks: BlocksInfo[];
            };
          }) => {
            const resp = data?.body?.blocks;
            setBlocks(resp);
          },
        )
        .catch(() => {});
      setIsLoading(false);
    }

    fetchTotalBlocks();
    fetchBlocks();
  }, [config?.backendUrl, props.currentPage]);

  const start = blocks?.[0];
  const end = blocks?.[blocks?.length - 1];

  const toggleShowAge = () => setShowAge((s) => !s);

  const columns = [
    {
      header: (
        <span className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider">
          BLOCK
        </span>
      ),
      key: 'block_hash',
      cell: (row: BlocksInfo) => (
        <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
          <a href={`/blocks/${row.block_hash}`} className="hover:no-underline">
            <a className="text-green-500 hover:no-underline">
              {localFormat(row.block_height)}
            </a>
          </a>
        </span>
      ),
    },
    {
      header: (
        <div className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap">
          <button
            type="button"
            onClick={toggleShowAge}
            className="px-6 py-4 text-left text-xs w-full font-semibold uppercase tracking-wider text-nearblue-500 focus:outline-none whitespace-nowrap"
          >
            {showAge ? 'AGE' : 'DATE TIME (UTC)'}
          </button>
        </div>
      ),
      key: 'block_timestamp',
      cell: (row: BlocksInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {!showAge
                    ? formatTimestampToString(
                        nanoToMilli(row.block_timestamp || 0),
                      )
                    : getTimeAgoString(nanoToMilli(row.block_timestamp || 0))}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                sideOffset={8}
                place="bottom"
              >
                {showAge
                  ? formatTimestampToString(
                      nanoToMilli(row.block_timestamp || 0),
                    )
                  : getTimeAgoString(nanoToMilli(row.block_timestamp || 0))}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
    },
    {
      header: (
        <span className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider">
          TXN
        </span>
      ),
      key: 'count',
      cell: (row: BlocksInfo) => (
        <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {localFormat(row.transactions_agg.count)}
        </span>
      ),
    },
    {
      header: (
        <span className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider">
          RECEIPT
        </span>
      ),
      key: 'count',
      cell: (row: BlocksInfo) => (
        <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {localFormat(row.receipts_agg.count)}
        </span>
      ),
    },
    {
      header: (
        <span className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider">
          AUTHOR
        </span>
      ),
      key: 'author_account_id',
      cell: (row: BlocksInfo) => (
        <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
          <a
            href={`/address/${row.author_account_id}`}
            className="hover:no-underline"
          >
            <a className="text-green-500 hover:no-underline">
              {shortenAddress(row.author_account_id)}
            </a>
          </a>
        </span>
      ),
    },
    {
      header: (
        <span className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap">
          GAS USED
        </span>
      ),
      key: 'gas_used',
      cell: (row: BlocksInfo) => (
        <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {row.chunks_agg.gas_used
            ? convertToMetricPrefix(row.chunks_agg.gas_used) + 'gas'
            : '0gas'}
        </span>
      ),
    },
    {
      header: (
        <span className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap">
          GAS LIMIT
        </span>
      ),
      key: 'gas_limit',
      cell: (row: BlocksInfo) => (
        <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {row.chunks_agg.gas_limit
            ? convertToMetricPrefix(row.chunks_agg.gas_limit) + 'gas'
            : '0gas'}
        </span>
      ),
    },
    {
      header: (
        <span className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap">
          GAS FEE
        </span>
      ),
      key: 'gas_price',
      cell: (row: BlocksInfo) => (
        <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {row.chunks_agg.gas_used && row.gas_price
            ? gasFee(row.chunks_agg.gas_used, row.gas_price)
            : '0 Ⓝ'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="bg-hero-pattern h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:sm:text-2xl text-xl text-white">
            Latest Near Protocol Blocks
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="block lg:flex lg:space-x-2">
          <div className="w-full ">
            <div className="bg-white border soft-shadow rounded-lg overflow-hidden">
              {isLoading ? (
                <Skelton className="leading-7" />
              ) : (
                <p className="leading-7 pl-6 text-sm py-4 text-gray-500">
                  Block #{localFormat(start?.block_height)} to
                  {'#' + localFormat(end?.block_height)} (Total of{' '}
                  {localFormat(totalCount)} blocks)
                </p>
              )}
              {
                <Widget
                  src={`${config.ownerId}/widget/bos-components.components.Shared.Table`}
                  props={{
                    columns: columns,
                    data: blocks,
                    isLoading: isLoading,
                    isPagination: true,
                    count: totalCount,
                    page: props.currentPage,
                    limit: 25,
                    pageLimit: 200,
                    setPage: props.setPage,
                  }}
                />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
