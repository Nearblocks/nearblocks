/**
 * Component: TransactionsList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Table of Transactions on Near Protocol.
 * @interface Props
 * @property {Function} t - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {Object.<string, string>} [filters] - Key-value pairs for filtering transactions. (Optional)
 *                                              Example: If provided, method=batch will filter the blocks with method=batch.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 * @param {function} [handleFilter] - Function to handle filter changes. (Optional)
 *                                    Example: handleFilter={handlePageFilter} where handlePageFilter is a function to filter the page.
 * @param {function} onFilterClear - Function to clear a specific or all filters. (Optional)
 *                                   Example: onFilterClear={handleClearFilter} where handleClearFilter is a function to clear the applied filters.
 */

interface Props {
  network: string;
  currentPage: number;
  filters: { [key: string]: string };
  setPage: (page: number) => void;
  handleFilter: (name: string, value: string) => void;
  onFilterClear: (name: string) => void;
  t: (key: string, options?: { count?: string }) => string;
}

import {
  localFormat,
  getTimeAgoString,
  formatTimestampToString,
  capitalizeFirstLetter,
} from '@/includes/formats';
import { txnMethod } from '@/includes/near';
import {
  getConfig,
  nanoToMilli,
  truncateString,
  yoctoToNear,
} from '@/includes/libs';
import FaLongArrowAltRight from '@/includes/icons/FaLongArrowAltRight';
import TxnStatus from '@/includes/Common/Status';
import Filter from '@/includes/Common/Filter';
import { TransactionInfo } from '@/includes/types';
import SortIcon from '@/includes/icons/SortIcon';
import CloseCircle from '@/includes/icons/CloseCircle';
import Skeleton from '@/includes/Common/Skeleton';

export default function (props: Props) {
  const {
    network,
    currentPage,
    filters,
    setPage,
    handleFilter,
    onFilterClear,
    t,
  } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(1);
  const [txns, setTxns] = useState<TransactionInfo[]>([]);
  const [showAge, setShowAge] = useState(true);
  const [sorting, setSorting] = useState('desc');
  const errorMessage = t ? t('txns:noTxns') : ' No transactions found!';

  const config = getConfig(network);

  const toggleShowAge = () => setShowAge((s) => !s);

  useEffect(() => {
    function fetchTotalTxns(qs?: string) {
      const queryParams = qs ? '?' + qs : '';
      asyncFetch(`${config?.backendUrl}txns/count${queryParams}`, {
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
          }) => {
            const resp = data?.body?.txns?.[0];
            setTotalCount(0);
            setTotalCount(resp?.count);
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTxnsData(qs?: string, sqs?: string) {
      setIsLoading(true);
      const queryParams = qs ? qs + '&' : '';
      asyncFetch(
        `${config?.backendUrl}txns?${queryParams}order=${sqs}&page=${currentPage}&per_page=25`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then((data: { body: { txns: TransactionInfo[] } }) => {
          const resp = data?.body?.txns;
          if (Array.isArray(resp) && resp.length > 0) {
            setTxns(resp);
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }
    let urlString = '';
    if (filters && Object.keys(filters).length > 0) {
      urlString = Object.keys(filters)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`,
        )
        .join('&');
    }

    if (urlString && sorting) {
      fetchTotalTxns(urlString);
      fetchTxnsData(urlString, sorting);
    } else if (urlString) {
      fetchTotalTxns(urlString);
      fetchTxnsData(urlString);
    } else if (sorting && (!filters || Object.keys(filters).length === 0)) {
      fetchTotalTxns();
      fetchTxnsData('', sorting);
    }
  }, [config?.backendUrl, currentPage, filters, sorting]);

  let filterValue: string;
  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    filterValue = event.target.value;
    // Do something with the value if needed
  };

  const onFilter = (
    e: React.MouseEvent<HTMLButtonElement>,
    name: string,
  ): void => {
    e.preventDefault();

    handleFilter(name, filterValue);
  };

  const onClear = (name: string) => {
    if (onFilterClear && filters) {
      onFilterClear(name);
    }
  };

  const onOrder = () => {
    setSorting((state) => (state === 'asc' ? 'desc' : 'asc'));
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
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-gray-500  flex justify-end ',
    },
    {
      header: <span>{t ? t('txns:hash') : 'TXN HASH'}</span>,
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
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: (
        <Popover.Root>
          <Popover.Trigger
            asChild
            className="flex items-center px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider focus:outline-none"
          >
            <button className="IconButton" aria-label="Update dimensions">
              {t ? t('txns:type') : 'METHOD'}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <div className="flex flex-col">
              <input
                name="type"
                value={filters ? filters?.method : ''}
                onChange={onInputChange}
                placeholder="Search by method"
                className="border rounded h-8 mb-2 px-2 text-gray-500 text-xs"
              />
              <div className="flex">
                <button
                  type="submit"
                  onClick={(e) => onFilter(e, 'method')}
                  className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t ? t('txns:filter.filter') : 'Filter'}
                </button>
                <button
                  name="type"
                  type="button"
                  onClick={() => onClear('method')}
                  className="flex-1 rounded bg-gray-300 text-xs h-7"
                >
                  {t ? t('txns:filter.clear') : 'Clear'}
                </button>
              </div>
            </div>
          </Popover.Content>
        </Popover.Root>
      ),
      key: 'actions',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="bg-blue-900/10 text-xs text-gray-500 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
                  <span className="block truncate">
                    {txnMethod(row.actions, t)}
                  </span>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
                side="bottom"
              >
                {txnMethod(row.actions, t)}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-gray-500',
    },
    {
      header: <span>{t ? t('txns:depositValue') : 'DEPOSIT VALUE'}</span>,
      key: 'deposit',
      cell: (row: TransactionInfo) => (
        <span>{yoctoToNear(row.actions_agg?.deposit || 0, true)} Ⓝ</span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('txns:txnFee') : 'TXN FEE'}</span>,
      key: 'transaction_fee',
      cell: (row: TransactionInfo) => (
        <span>
          {' '}
          {yoctoToNear(row.outcomes_agg?.transaction_fee || 0, true)} Ⓝ
        </span>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
    },
    {
      header: (
        <Popover.Root>
          <Popover.Trigger
            asChild
            className="flex items-center px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider focus:outline-none"
          >
            <button className="IconButton" aria-label="Update dimensions">
              {t ? t('txns:from') : 'FROM'}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <input
              name="from"
              value={filters ? filters?.from : ''}
              onChange={onInputChange}
              placeholder={
                t ? t('txns:filter.placeholder') : 'Search by address e.g. Ⓝ..'
              }
              className="border rounded h-8 mb-2 px-2 text-gray-500 text-xs"
            />
            <div className="flex">
              <button
                type="submit"
                onClick={(e) => onFilter(e, 'from')}
                className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
              >
                <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                {t ? t('txns:filter.filter') : 'Filter'}
              </button>
              <button
                name="from"
                type="button"
                onClick={() => onClear('from')}
                className="flex-1 rounded bg-gray-300 text-xs h-7"
              >
                {t ? t('txns:filter.clear') : 'Clear'}
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
      ),
      key: 'signer_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                  <a
                    href={`/address/${row.signer_account_id}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 hover:no-underline">
                      {row.signer_account_id}
                    </a>
                  </a>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {truncateString(row.signer_account_id, 18, '...')}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
    },
    {
      header: <span></span>,
      key: '',
      cell: () => (
        <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
          <FaLongArrowAltRight />
        </div>
      ),
    },
    {
      header: (
        <Popover.Root>
          <Popover.Trigger
            asChild
            className="flex items-center px-6 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider focus:outline-none"
          >
            <button className="IconButton" aria-label="Update dimensions">
              {t ? t('txns:to') : 'To'}
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <input
              name="to"
              value={filters ? filters?.to : ''}
              onChange={onInputChange}
              placeholder={
                t ? t('txns:filter.placeholder') : 'Search by address e.g. Ⓝ..'
              }
              className="border rounded h-8 mb-2 px-2 text-gray-500 text-xs"
            />
            <div className="flex">
              <button
                type="submit"
                onClick={(e) => onFilter(e, 'to')}
                className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
              >
                <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                {t ? t('txns:filter.filter') : 'Filter'}
              </button>
              <button
                name="to"
                type="button"
                onClick={() => onClear('to')}
                className="flex-1 rounded bg-gray-300 text-xs h-7"
              >
                {t ? t('txns:filter.clear') : 'Clear'}
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
      ),
      key: 'receiver_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  <a
                    href={`/address/${row.receiver_account_id}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 hover:no-underline">
                      {truncateString(row.receiver_account_id, 17, '...')}
                    </a>
                  </a>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {row.receiver_account_id}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
    },
    {
      header: <span>{t ? t('txns:blockHeight') : ' BLOCK HEIGHT'}</span>,
      key: 'block_height',
      cell: (row: TransactionInfo) => (
        <span>
          <a
            href={`/blocks/${row.included_in_block_hash}`}
            className="hover:no-underline"
          >
            <a className="text-green-500 hover:no-underline">
              {localFormat(row.block?.block_height)}
            </a>
          </a>
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
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
              {showAge
                ? t
                  ? t('txns:age')
                  : 'AGE'
                : t
                ? t('txns:ageDT')
                : 'DATE TIME (UTC)'}
            </button>
            <button type="button" onClick={onOrder} className="px-2">
              <div className="text-gray-500 font-semibold">
                <SortIcon order={sorting} />
              </div>
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
  ];

  return (
    <div className=" bg-white border soft-shadow rounded-lg overflow-hidden">
      {isLoading ? (
        <div className="pl-6 max-w-lg w-full py-4 h-[60px]">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 pl-6 text-sm mb-4 text-gray-500">
              {t
                ? t('txns:listing', {
                    count: localFormat(totalCount),
                  })
                : `More than > ${totalCount} transactions found`}
            </p>
          </div>
          {filters && Object.keys(filters).length > 0 && (
            <div className="flex items-center px-2 text-sm mb-4 text-gray-500 lg:ml-auto">
              Filtered By:
              <span className="flex items-center bg-gray-100 rounded-full px-3 py-1 ml-1 space-x-2">
                {filters &&
                  Object.keys(filters).map((key) => (
                    <span className="flex" key={key}>
                      {capitalizeFirstLetter(key)}:{' '}
                      <span className="inline-block truncate max-w-[120px]">
                        <span className="font-semibold">{filters[key]}</span>
                      </span>
                    </span>
                  ))}
                <CloseCircle
                  className="w-4 h-4 fill-current cursor-pointer"
                  onClick={onClear}
                />
              </span>
            </div>
          )}
        </div>
      )}
      {
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
      }
    </div>
  );
}
