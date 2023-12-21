/**
 * Component: TransactionsList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Table of Transactions on Near Protocol.
 * @interface Props
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
import Skelton from '@/includes/Common/Skelton';
import CloseCircle from '@/includes/icons/CloseCircle';

export default function (props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(1);
  const [txns, setTxns] = useState<TransactionInfo[]>([]);
  const [showAge, setShowAge] = useState(true);

  const [sorting, setSorting] = useState('desc');

  const config = getConfig(props.network);

  const toggleShowAge = () => setShowAge((s) => !s);

  useEffect(() => {
    function fetchTotalTxns(qs?: string) {
      setIsLoading(true);
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
        .finally(() => {
          setIsLoading(false);
        });
    }

    function fetchTxnsData(qs?: string, sqs?: string) {
      setIsLoading(true);
      const queryParams = qs ? qs + '&' : '';
      asyncFetch(
        `${config?.backendUrl}txns?${queryParams}order=${sqs}&page=${props.currentPage}&per_page=25`,
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
        .catch(() => {});
      setIsLoading(false);
    }
    let urlString = '';
    if (props?.filters && Object.keys(props.filters).length > 0) {
      urlString = Object.keys(props.filters)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(
              props?.filters[key],
            )}`,
        )
        .join('&');
    }

    if (urlString && sorting) {
      fetchTotalTxns(urlString);
      fetchTxnsData(urlString, sorting);
    } else if (urlString) {
      fetchTotalTxns(urlString);
      fetchTxnsData(urlString);
    } else if (
      sorting &&
      (!props.filters || Object.keys(props.filters).length === 0)
    ) {
      fetchTotalTxns();
      fetchTxnsData('', sorting);
    }
  }, [config?.backendUrl, props.currentPage, props?.filters, sorting]);

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

    props.handleFilter(name, filterValue);
  };

  const onClear = (name: string) => {
    if (props.onFilterClear && props.filters) {
      props.onFilterClear(name);
    }
  };

  const onOrder = () => {
    setSorting((state) => (state === 'asc' ? 'desc' : 'asc'));
  };

  const columns = [
    {
      header: '',
      key: '',
      cell: (row: TransactionInfo) => (
        <span className="pl-5 pr-2 py-4 whitespace-nowrap text-sm text-gray-500  flex justify-end ">
          <TxnStatus status={row.outcomes.status} showLabel={false} />
        </span>
      ),
    },
    {
      header: (
        <span className="px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider">
          TXN HASH
        </span>
      ),
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
                    <a className="text-green-500 font-medium">
                      {truncateString(row.transaction_hash, 15, '...')}
                    </a>
                  </a>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                sideOffset={8}
                place="bottom"
              >
                {row.transaction_hash}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
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
              METHOD
              <Filter className="h-3 w-3 fill-current mr-2" />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <div>
              <input
                name="type"
                value={props?.filters ? props?.filters?.method : ''}
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
                  <Filter className="h-3 w-3 fill-current mr-2" /> Filter
                </button>
                <button
                  name="type"
                  type="button"
                  onClick={() => onClear('method')}
                  className="flex-1 rounded bg-gray-300 text-xs h-7"
                >
                  Clear
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
              <Tooltip.Trigger
                asChild
                className="px-5 py-4 whitespace-nowrap text-sm text-gray-500"
              >
                <span className="bg-blue-900/10 text-xs text-gray-500 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
                  <span className="block truncate">
                    {truncateString(txnMethod(row.actions).trim(), 15, '...')}
                  </span>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                sideOffset={8}
                place="bottom"
              >
                {txnMethod(row.actions)}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
    },
    {
      header: (
        <span className="px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap">
          DEPOSIT VALUE
        </span>
      ),
      key: 'deposit',
      cell: (row: TransactionInfo) => (
        <span className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
          {yoctoToNear(row.actions_agg?.deposit || 0, true)} Ⓝ
        </span>
      ),
    },
    {
      header: (
        <span className="px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap">
          TXN FEE
        </span>
      ),
      key: 'transaction_fee',
      cell: (row: TransactionInfo) => (
        <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {' '}
          {yoctoToNear(row.outcomes_agg?.transaction_fee || 0, true)} Ⓝ
        </span>
      ),
    },
    {
      header: (
        <Popover.Root>
          <Popover.Trigger
            asChild
            className="flex items-center text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider focus:outline-none"
          >
            <button className="IconButton" aria-label="Update dimensions">
              FROM
              <Filter className="h-3 w-3 fill-current mr-2" />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <input
              name="from"
              value={props?.filters ? props?.filters?.from : ''}
              onChange={onInputChange}
              placeholder={'Search by address e.g. Ⓝ..'}
              className="border rounded h-8 mb-2 px-2 text-gray-500 text-xs"
            />
            <div className="flex">
              <button
                type="submit"
                onClick={(e) => onFilter(e, 'from')}
                className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
              >
                <Filter className="h-3 w-3 fill-current mr-2" /> Filter
              </button>
              <button
                name="from"
                type="button"
                onClick={() => onClear('from')}
                className="flex-1 rounded bg-gray-300 text-xs h-7"
              >
                Clear
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
                    <a className="text-green-500">
                      {truncateString(row.signer_account_id, 18, '...')}
                    </a>
                  </a>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                sideOffset={8}
                place="bottom"
              >
                {row.signer_account_id}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
    },
    {
      header: '',
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
            className="flex items-center text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider focus:outline-none"
          >
            <button className="IconButton" aria-label="Update dimensions">
              To
              <Filter className="h-3 w-3 fill-current mr-2" />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <input
              name="to"
              value={props?.filters ? props?.filters?.to : ''}
              onChange={onInputChange}
              placeholder={'Search by address e.g. Ⓝ..'}
              className="border rounded h-8 mb-2 px-2 text-gray-500 text-xs"
            />
            <div className="flex">
              <button
                type="submit"
                onClick={(e) => onFilter(e, 'to')}
                className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
              >
                <Filter className="h-3 w-3 fill-current mr-2" /> Filter
              </button>
              <button
                name="to"
                type="button"
                onClick={() => onClear('to')}
                className="flex-1 rounded bg-gray-300 text-xs h-7"
              >
                Clear
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
                <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                  <a
                    href={`/address/${row.receiver_account_id}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500">
                      {truncateString(row.receiver_account_id, 17, '...')}
                    </a>
                  </a>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                sideOffset={8}
                place="bottom"
              >
                {row.receiver_account_id}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
    },
    {
      header: (
        <span className="px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap">
          BLOCK HEIGHT
        </span>
      ),
      key: 'block_height',
      cell: (row: TransactionInfo) => (
        <span className="px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
          <a
            href={`/blocks/${row.included_in_block_hash}`}
            className="hover:no-underline"
          >
            <a className="text-green-500">
              {localFormat(row.block?.block_height)}
            </a>
          </a>
        </span>
      ),
    },
    {
      header: (
        <span className="inline-flex">
          <div className="w-full inline-flex px-5 py-4">
            <button
              type="button"
              onClick={toggleShowAge}
              className="text-left text-xs w-full font-semibold uppercase tracking-wider text-nearblue-600 focus:outline-none whitespace-nowrap"
            >
              {showAge ? 'AGE' : 'DATE TIME (UTC)'}
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
        <span className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
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
                sideOffset={8}
                place="bottom"
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
    },
  ];

  return (
    <div>
      <div className="bg-hero-pattern h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:sm:text-2xl text-xl text-white">
            Latest Near Protocol transactions
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="block lg:flex lg:space-x-2">
          <div className="w-full">
            <div className="bg-white border soft-shadow rounded-lg overflow-hidden">
              {isLoading ? (
                <Skelton />
              ) : (
                <div className={`flex flex-col lg:flex-row pt-4`}>
                  <div className="flex flex-col">
                    <p className="leading-7 pl-6 text-sm mb-4 text-gray-500">
                      {`More than > ${totalCount} transactions found`}
                    </p>
                  </div>
                  {props?.filters && Object.keys(props?.filters).length > 0 && (
                    <div className="flex items-center px-2 text-sm mb-4 text-gray-500 lg:ml-auto">
                      Filtered By:
                      <span className="flex items-center bg-gray-100 rounded-full px-3 py-1 ml-1 space-x-2">
                        {props?.filters &&
                          Object.keys(props?.filters).map((key) => (
                            <span className="flex" key={key}>
                              {capitalizeFirstLetter(key)}:{' '}
                              <span className="inline-block truncate max-w-[120px]">
                                <span className="font-semibold">
                                  {props?.filters[key]}
                                </span>
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
