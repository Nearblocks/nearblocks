/**
 * Component: AddressTransactions
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Transactions of address on Near Protocol.
 * @interface Props
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [id] - The account identifier passed as a string.
 * @param {Object.<string, string>} [filters] - Key-value pairs for filtering transactions. (Optional)
 *                                              Example: If provided, method=batch will filter the blocks with method=batch.
 * @param {function} [handleFilter] - Function to handle filter changes. (Optional)
 *                                    Example: handleFilter={handlePageFilter} where handlePageFilter is a function to filter the page.
 * @param {function} [onFilterClear] - Function to clear a specific or all filters. (Optional)
 *                                     Example: onFilterClear={handleClearFilter} where handleClearFilter is a function to clear the applied filters.
 */

interface Props {
  network: string;
  t: (key: string, options?: { count?: string | undefined }) => string;
  id: string;
  filters: { [key: string]: string };
  handleFilter: (name: string, value: string) => void;
  onFilterClear: (name: string) => void;
}

import Filter from '@/includes/Common/Filter';
import Skeleton from '@/includes/Common/Skeleton';
import TxnStatus from '@/includes/Common/Status';
import {
  capitalizeFirstLetter,
  formatTimestampToString,
  getTimeAgoString,
  localFormat,
} from '@/includes/formats';
import Clock from '@/includes/icons/Clock';
import CloseCircle from '@/includes/icons/CloseCircle';
import Download from '@/includes/icons/Download';
import SortIcon from '@/includes/icons/SortIcon';
import {
  getConfig,
  handleRateLimit,
  isAction,
  nanoToMilli,
  yoctoToNear,
} from '@/includes/libs';
import { txnMethod } from '@/includes/near';
import { TransactionInfo } from '@/includes/types';

export default function ({
  network,
  t,
  id,
  filters,
  handleFilter,
  onFilterClear,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [txns, setTxns] = useState<{ [key: number]: TransactionInfo[] }>({});
  const [showAge, setShowAge] = useState(true);
  const [sorting, setSorting] = useState('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterValue, setFilterValue] = useState<Record<string, string>>({});
  const errorMessage = t ? t('txns:noTxns') : ' No transactions found!';
  const [address, setAddress] = useState('');

  const config = getConfig(network);

  const toggleShowAge = () => setShowAge((s) => !s);

  useEffect(() => {
    function fetchTotalTxns(qs?: string) {
      const queryParams = qs ? '?' + qs : '';
      asyncFetch(
        `${config?.backendUrl}account/${id}/txns/count${queryParams}`,
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
              txns: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns?.[0];
            if (data.status === 200) {
              setTotalCount(resp?.count ?? 0);
            } else {
              handleRateLimit(data, () => fetchTotalTxns(qs));
            }
          },
        )
        .catch(() => {});
    }

    function fetchTxnsData(qs: string, sqs: string, page: number) {
      setIsLoading(true);
      const queryParams = qs ? qs + '&' : '';
      asyncFetch(
        `${config?.backendUrl}account/${id}/txns?${queryParams}order=${sqs}&page=${page}&per_page=25`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then((data: { body: { txns: TransactionInfo[] }; status: number }) => {
          const resp = data?.body?.txns;
          if (data.status === 200) {
            if (Array.isArray(resp) && resp.length > 0) {
              setTxns((prevData) => ({ ...prevData, [page]: resp || [] }));
            } else if (resp.length === 0) {
              setTxns({});
            }
            setIsLoading(false);
          } else {
            handleRateLimit(
              data,
              () => fetchTxnsData(qs, sorting, page),
              () => setIsLoading(false),
            );
          }
        })
        .catch(() => {});
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
      fetchTxnsData(urlString, sorting, currentPage);
    } else if (sorting && (!filters || Object.keys(filters).length === 0)) {
      fetchTotalTxns();
      fetchTxnsData('', sorting, currentPage);
    }
  }, [config?.backendUrl, id, currentPage, filters, sorting]);

  const onInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    name: string,
  ): void => {
    setFilterValue((prevFilters) => ({
      ...prevFilters,
      [name]: event.target.value,
    }));
  };

  const onFilter = (
    e: React.MouseEvent<HTMLButtonElement>,
    name: string,
  ): void => {
    e.preventDefault();

    if (filterValue[name] !== undefined && filterValue[name] !== null) {
      if (name === 'type') {
        if (isAction(filterValue[name])) {
          handleFilter('action', filterValue[name]);
        } else {
          handleFilter('method', filterValue[name]);
        }
      } else {
        handleFilter(name, filterValue[name]);
      }
    }
  };

  const onClear = (name: string) => {
    if (onFilterClear && filters) {
      onFilterClear(name);
      setFilterValue((prevFilters) => ({
        ...prevFilters,
        [name]: '',
      }));
    }
  };

  const onOrder = () => {
    setSorting((state) => (state === 'asc' ? 'desc' : 'asc'));
  };

  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();

    setAddress(id);
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
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-nearblue-600  flex justify-end ',
    },
    {
      header: <span>{t ? t('txns:hash') : 'TXN HASH'}</span>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 whitespace-nowrap">
                  <Link
                    href={`/txns/${row.transaction_hash}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 font-medium hover:no-underline">
                      {row.transaction_hash}
                    </a>
                  </Link>
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
      tdClassName: 'px-5 py-4 text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
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
            className="z-50 bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <div className="flex flex-col">
              <input
                name="type"
                value={filterValue['type']}
                onChange={(e) => onInputChange(e, 'type')}
                placeholder="Search by method"
                className="border rounded h-8 mb-2 px-2 text-nearblue-600 text-xs"
              />
              <div className="flex">
                <button
                  type="submit"
                  onClick={(e) => onFilter(e, 'type')}
                  className="flex items-center justify-center flex-1 rounded bg-green-500 h-7 text-white text-xs mr-2"
                >
                  <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                  {t ? t('txns:filter.filter') : 'Filter'}
                </button>
                <button
                  name="type"
                  type="button"
                  onClick={() => onClear('type')}
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
                <span className="bg-blue-900/10 text-xs text-nearblue-600 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
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
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
    },
    {
      header: <span>{t ? t('txns:depositValue') : 'DEPOSIT VALUE'}</span>,
      key: 'deposit',
      cell: (row: TransactionInfo) => (
        <span>
          {row.actions_agg?.deposit
            ? yoctoToNear(row.actions_agg?.deposit, true)
            : row.actions_agg?.deposit ?? ''}{' '}
          Ⓝ
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('txns:txnFee') : 'TXN FEE'}</span>,
      key: 'transaction_fee',
      cell: (row: TransactionInfo) => (
        <span>
          {row.outcomes_agg?.transaction_fee
            ? yoctoToNear(row.outcomes_agg?.transaction_fee, true)
            : ''}{' '}
          Ⓝ
        </span>
      ),
      tdClassName: 'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left whitespace-nowrap text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
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
            className="z-50 bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <input
              name="from"
              value={filterValue['from']}
              onChange={(e) => onInputChange(e, 'from')}
              placeholder={
                t ? t('txns:filter.placeholder') : 'Search by address e.g. Ⓝ..'
              }
              className="border rounded h-8 mb-2 px-2 text-nearblue-600 text-xs"
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
      key: 'predecessor_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 whitespace-nowrap ${
                    row?.predecessor_account_id === address
                      ? ' rounded-md bg-[#FFC10740] border-[#FFC10740] border border-dashed p-0.5 px-1 -m-[1px] cursor-pointer text-[#033F40]'
                      : 'text-green-500 p-0.5 px-1'
                  }`}
                >
                  <Link
                    href={`/address/${row.predecessor_account_id}`}
                    className="hover:no-underline"
                  >
                    <a
                      className="text-green-500 hover:no-underline"
                      onMouseOver={(e) =>
                        onHandleMouseOver(e, row?.predecessor_account_id)
                      }
                    >
                      {row.predecessor_account_id}
                    </a>
                  </Link>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {row.predecessor_account_id}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 text-sm text-nearblue-600 font-medium',
    },
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => {
        return row.predecessor_account_id === row.receiver_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 flex items-center justify-center bg-green-200 text-white text-xs font-semibold">
            {t ? t('txns:txnSelf') : 'SELF'}
          </span>
        ) : id === row.predecessor_account_id ? (
          <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-yellow-100 text-yellow-700 text-xs font-semibold">
            {t ? t('txns:txnOut') : 'OUT'}
          </span>
        ) : (
          <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-neargreen text-white text-xs font-semibold">
            {t ? t('txns:txnIn') : 'IN'}
          </span>
        );
      },
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
            className="z-50 bg-white shadow-lg border rounded-b-lg p-2"
            sideOffset={5}
          >
            <input
              name="to"
              value={filterValue['to']}
              onChange={(e) => onInputChange(e, 'to')}
              placeholder={
                t ? t('txns:filter.placeholder') : 'Search by address e.g. Ⓝ..'
              }
              className="border rounded h-8 mb-2 px-2 text-nearblue-600 text-xs"
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
                <span
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 whitespace-nowrap ${
                    row?.receiver_account_id === address
                      ? ' rounded-md bg-[#FFC10740] border-[#FFC10740] border border-dashed p-0.5 px-1 -m-[1px] cursor-pointer text-[#033F40]'
                      : 'text-green-500 p-0.5 px-1'
                  }`}
                >
                  <Link
                    href={`/address/${row.receiver_account_id}`}
                    className="hover:no-underline"
                  >
                    <a
                      className="text-green-500 hover:no-underline"
                      onMouseOver={(e) =>
                        onHandleMouseOver(e, row?.receiver_account_id)
                      }
                    >
                      {row.receiver_account_id}
                    </a>
                  </Link>
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
      tdClassName: 'px-5 py-4 text-sm text-nearblue-600 font-medium',
    },
    {
      header: <span>{t ? t('txns:blockHeight') : ' BLOCK HEIGHT'}</span>,
      key: 'block_height',
      cell: (row: TransactionInfo) => (
        <span>
          <Link
            href={`/blocks/${row.included_in_block_hash}`}
            className="hover:no-underline"
          >
            <a className="text-green-500 hover:no-underline">
              {row.block?.block_height
                ? localFormat(row.block?.block_height)
                : ''}
            </a>
          </Link>
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
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
                  className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider text-green-500 focus:outline-none whitespace-nowrap"
                >
                  {showAge
                    ? t
                      ? t('txns:age')
                      : 'AGE'
                    : t
                    ? t('txns:ageDT')
                    : 'DATE TIME (UTC)'}
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
          <button type="button" onClick={onOrder} className="px-2">
            <div className="text-nearblue-600 font-semibold">
              <SortIcon order={sorting} />
            </div>
          </button>
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
                    ? row.block_timestamp
                      ? formatTimestampToString(
                          nanoToMilli(row.block_timestamp),
                        )
                      : ''
                    : row.block_timestamp
                    ? getTimeAgoString(nanoToMilli(row.block_timestamp))
                    : ''}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {showAge
                  ? row.block_timestamp
                    ? formatTimestampToString(nanoToMilli(row.block_timestamp))
                    : ''
                  : row.block_timestamp
                  ? getTimeAgoString(nanoToMilli(row.block_timestamp))
                  : ''}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName: 'whitespace-nowrap',
    },
  ];

  return (
    <div className="bg-white soft-shadow rounded-xl pb-1">
      {isLoading ? (
        <div className="pl-6 max-w-lg w-full py-5 ">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 px-3 text-sm mb-4 text-nearblue-600">
              A total of {totalCount ? localFormat(totalCount.toString()) : 0}{' '}
              transactions found
            </p>
          </div>
          <div className=" flex items-center px-2 text-sm mb-4 text-nearblue-600 lg:ml-auto">
            {filters && Object.keys(filters).length > 0 && (
              <div className="flex items-center px-2 text-sm text-gray-500 lg:ml-auto">
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
            <span className="text-xs text-nearblue-600">
              <a
                href={`/exportdata?address=${id}`}
                className="hover:no-underline"
                target="_blank"
              >
                <a
                  target="_blank"
                  className="cursor-pointer mx-1 flex items-center text-nearblue-600 font-medium py-2  border border-neargray-700 px-4 rounded-md bg-white hover:bg-neargray-800 hover:no-underline"
                >
                  <p>CSV Export </p>
                  <span className="ml-2">
                    <Download />
                  </span>
                </a>
              </a>
            </span>
          </div>
        </div>
      )}
      {
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
      }
    </div>
  );
}
