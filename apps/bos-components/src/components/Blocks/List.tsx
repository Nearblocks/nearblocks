/**
 * Component: BlocksList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Table of blocks on Near Protocol.
 * @interface Props
 * @property {Function} t - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 */

import Skeleton from '@/includes/Common/Skeleton';
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
  network: string;
  t: (
    key: string,
    options?: { from: string; to: string; count: string },
  ) => string | undefined;
}

export default function ({ currentPage, setPage, t, network }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [blocks, setBlocks] = useState<BlocksInfo[]>([]);
  const [showAge, setShowAge] = useState(true);
  const errorMessage = t ? t('blocks:noBlocks') : 'No blocks!';

  const config = getConfig(network);

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
        `${config?.backendUrl}blocks?page=${currentPage}&per_page=25`,
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
            setBlocks(resp || []);
          },
        )
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }

    fetchTotalBlocks();
    fetchBlocks();
  }, [config?.backendUrl, currentPage]);

  const start = blocks?.[0];
  const end = blocks?.[blocks?.length - 1];

  const toggleShowAge = () => setShowAge((s) => !s);

  const columns = [
    {
      header: <span>{t ? t('blocks:blocks') : 'BLOCK'}</span>,
      key: 'block_hash',
      cell: (row: BlocksInfo) => (
        <span>
          <a href={`/blocks/${row.block_hash}`} className="hover:no-underline">
            <a className="text-green-500 hover:no-underline">
              {localFormat(row.block_height)}
            </a>
          </a>
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: (
        <div>
          <button
            type="button"
            onClick={toggleShowAge}
            className="px-6 py-2 text-left text-xs w-full font-semibold uppercase tracking-wider text-nearblue-500 focus:outline-none whitespace-nowrap"
          >
            {showAge ? (t ? t('blocks:age') : 'AGE') : 'DATE TIME (UTC)'}
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
                align="center"
                side="bottom"
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
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
    },
    {
      header: <span>{t ? t('blocks:txn') : 'TXN'}</span>,
      key: 'count',
      cell: (row: BlocksInfo) => (
        <span>{localFormat(row.transactions_agg.count)}</span>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('blocks:block.receipt') : 'RECEIPT'}</span>,
      key: 'count',
      cell: (row: BlocksInfo) => (
        <span>{localFormat(row.receipts_agg.count)}</span>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('blocks:miner') : 'AUTHOR'}</span>,
      key: 'author_account_id',
      cell: (row: BlocksInfo) => (
        <span>
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
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('blocks:block.gasUsed') : 'GAS USED'}</span>,
      key: 'gas_used',
      cell: (row: BlocksInfo) => (
        <span>
          {row.chunks_agg.gas_used
            ? convertToMetricPrefix(row.chunks_agg.gas_used) + 'gas'
            : '0 gas'}
        </span>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('blocks:block.gasLimit') : 'GAS LIMIT'}</span>,
      key: 'gas_limit',
      cell: (row: BlocksInfo) => (
        <span>
          {row.chunks_agg.gas_limit
            ? convertToMetricPrefix(row.chunks_agg.gas_limit) + 'gas'
            : '0 gas'}
        </span>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('block.gasFee') : 'GAS FEE'}</span>,
      key: 'gas_price',
      cell: (row: BlocksInfo) => (
        <span>
          {row.chunks_agg.gas_used && row.gas_price
            ? gasFee(row.chunks_agg.gas_used, row.gas_price)
            : '0 Ⓝ'}
        </span>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
  ];

  return (
    <>
      {isLoading ? (
        <div className="pl-6 max-w-sm py-4 h-[60px]">
          <Skeleton />
        </div>
      ) : (
        <p className="leading-7 pl-6 text-sm py-4 text-gray-500">
          {t
            ? t('blocks:listing', {
                from: localFormat(start?.block_height | 0),
                to: localFormat(end?.block_height | 0),
                count: localFormat(totalCount | 0),
              })
            : `Block #${localFormat(start?.block_height)} to ${
                '#' + localFormat(end?.block_height)
              } (Total of ${localFormat(totalCount)} blocks)`}
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
            page: currentPage,
            limit: 25,
            pageLimit: 200,
            setPage: setPage,
            Error: errorMessage,
          }}
        />
      }
    </>
  );
}
