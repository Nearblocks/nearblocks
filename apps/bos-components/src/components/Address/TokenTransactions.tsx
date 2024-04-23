/**
 * Component: AddressTokenTransactions
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Tokens Transactions of address on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [id] - The account identifier passed as a string
 * @param {Object.<string, string>} [filters] - Key-value pairs for filtering transactions. (Optional)
 *                                              Example: If provided, method=batch will filter the blocks with method=batch.
 * @param {function} [handleFilter] - Function to handle filter changes. (Optional)
 *                                    Example: handleFilter={handlePageFilter} where handlePageFilter is a function to filter the page.
 * @param {function} [onFilterClear] - Function to clear a specific or all filters. (Optional)
 *                                     Example: onFilterClear={handleClearFilter} where handleClearFilter is a function to clear the applied filters.
 * @param {string} ownerId - The identifier of the owner of the component.
 */
interface Props {
  ownerId: string;
  network: string;
  t: (key: string, options?: { count?: string }) => string;
  id: string;
  filters: { [key: string]: string };
  handleFilter: (name: string, value: string) => void;
  onFilterClear: (name: string) => void;
}

import ErrorMessage from '@/includes/Common/ErrorMessage';
import Filter from '@/includes/Common/Filter';
import Skeleton from '@/includes/Common/Skeleton';
import TxnStatus from '@/includes/Common/Status';
import Clock from '@/includes/icons/Clock';
import CloseCircle from '@/includes/icons/CloseCircle';
import Download from '@/includes/icons/Download';
import FaInbox from '@/includes/icons/FaInbox';
import SortIcon from '@/includes/icons/SortIcon';
import TokenImage from '@/includes/icons/TokenImage';
import { TransactionInfo } from '@/includes/types';

export default function ({
  network,
  t,
  id,
  ownerId,
  filters,
  handleFilter,
  onFilterClear,
}: Props) {
  const {
    capitalizeFirstLetter,
    formatTimestampToString,
    getTimeAgoString,
    localFormat,
  } = VM.require(`${ownerId}/widget/includes.Utils.formats`);

  const { getConfig, handleRateLimit, nanoToMilli, truncateString } =
    VM.require(`${ownerId}/widget/includes.Utils.libs`);

  const { tokenAmount } = VM.require(`${ownerId}/widget/includes.Utils.near`);

  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showAge, setShowAge] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const errorMessage = t ? t('txns:noTxns') : 'No transactions found!';
  const [tokens, setTokens] = useState<{ [key: number]: TransactionInfo[] }>(
    {},
  );
  const [sorting, setSorting] = useState('desc');
  const [address, setAddress] = useState('');
  const [filterValue, setFilterValue] = useState<Record<string, string>>({});

  const config = getConfig && getConfig(network);

  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    function fetchTotalTokens(qs?: string) {
      const queryParams = qs ? '?' + qs : '';
      asyncFetch(
        `${config?.backendUrl}account/${id}/ft-txns/count?${queryParams}`,
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
              setTotalCount(resp?.count | 0);
            } else {
              handleRateLimit(data, () => fetchTotalTokens(qs));
            }
          },
        )
        .catch(() => {});
    }

    function fetchTokens(qs: string, sqs: string, page: number) {
      setIsLoading(true);
      const queryParams = qs ? qs + '&' : '';
      asyncFetch(
        `${config?.backendUrl}account/${id}/ft-txns?${queryParams}order=${sqs}&page=${page}&per_page=25`,
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
              txns: TransactionInfo[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns;
            if (data.status === 200) {
              if (Array.isArray(resp) && resp.length > 0) {
                setTokens((prevData) => ({ ...prevData, [page]: resp || [] }));
              } else if (resp.length === 0) {
                setTokens({});
              }
              setIsLoading(false);
            } else {
              handleRateLimit(
                data,
                () => fetchTokens(qs, sorting, page),
                () => setIsLoading(false),
              );
            }
          },
        )
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
      fetchTotalTokens(urlString);
      fetchTokens(urlString, sorting, currentPage);
    } else if (sorting && (!filters || Object.keys(filters).length === 0)) {
      fetchTotalTokens();
      fetchTokens('', sorting, currentPage);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, id, currentPage, filters, sorting]);

  const toggleShowAge = () => setShowAge((s) => !s);

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

    if (filterValue[name] !== null && filterValue[name] !== undefined) {
      handleFilter(name, filterValue[name]);
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
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus status={row.outcomes.status} showLabel={false} />
        </>
      ),
      tdClassName:
        'pl-5 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <>{t ? t('txns:hash') : 'TXN HASH'}</>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[120px] inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap">
                  <Link
                    href={`/txns/${row.transaction_hash}`}
                    className="hover:no-underline"
                  >
                    <a className="text-green-500 dark:text-green-250 font-medium hover:no-underline">
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
      tdClassName: 'px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: (
        <>
          {' '}
          <Popover.Root>
            <Popover.Trigger
              asChild
              className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
            >
              <button className="IconButton" aria-label="Update dimensions">
                {t ? t('txns:type') : 'METHOD'}
                <Filter className="h-4 w-4 fill-current ml-2" />
              </button>
            </Popover.Trigger>
            <Popover.Content
              className="z-50 bg-white dark:bg-black-600 shadow-lg border dark:border-black-200 rounded-b-lg p-2"
              sideOffset={5}
            >
              <div className="flex flex-col">
                <input
                  name="event"
                  value={filterValue['event']}
                  onChange={(e) => onInputChange(e, 'event')}
                  placeholder="Search by method"
                  className="border dark:border-black-200 rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
                />
                <div className="flex">
                  <button
                    type="submit"
                    onClick={(e) => onFilter(e, 'event')}
                    className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 dark:text-black h-7 text-white text-xs mr-2"
                  >
                    <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                    {t ? t('txns:filter.filter') : 'Filter'}
                  </button>
                  <button
                    name="type"
                    type="button"
                    onClick={() => onClear('event')}
                    className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-white text-xs h-7 "
                  >
                    {t ? t('txns:filter.clear') : 'Clear'}
                  </button>
                </div>
              </div>
            </Popover.Content>
          </Popover.Root>
        </>
      ),
      key: 'cause',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="bg-blue-900/10 text-xs text-nearblue-600 dark:text-neargray-10 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
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
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
    },
    {
      header: <>Affected</>,
      key: 'affected_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          {row?.affected_account_id ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span
                    className={` inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 rounded-md border ${
                      row?.affected_account_id === address
                        ? ' bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
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
        'px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: '',
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          {row.involved_account_id === row.affected_account_id ? (
            <span className="uppercase rounded w-10 py-2 h-6 flex items-center justify-center bg-green-200 dark:bg-nearblue-650/[0.15] dark:text-neargray-650 dark:border dark:border-nearblue-650/[0.25] text-white text-xs font-semibold">
              {t ? t('txns:txnSelf') : 'SELF'}
            </span>
          ) : Number(row?.delta_amount) < 0 ? (
            <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-yellow-100 dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60 text-yellow-700 text-xs font-semibold">
              {t ? t('txns:txnOut') : 'OUT'}
            </span>
          ) : (
            <span className="uppercase rounded w-10 h-6 flex items-center justify-center bg-neargreen dark:bg-green-500/[0.15] dark:text-neargreen-300 dark:border dark:border-green-400/75 text-white text-xs font-semibold">
              {t ? t('txns:txnIn') : 'IN'}
            </span>
          )}
        </>
      ),
      tdClassName: 'text-center',
    },
    {
      header: (
        <Popover.Root>
          <Popover.Trigger
            asChild
            className="flex items-center px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider focus:outline-none"
          >
            <button className="IconButton" aria-label="Update dimensions">
              Involved
              <Filter className="h-4 w-4 fill-current ml-2" />
            </button>
          </Popover.Trigger>
          <Popover.Content
            className="bg-white dark:bg-black-600  shadow-lg border dark:border-black-200 rounded-b-lg p-2"
            sideOffset={5}
          >
            <input
              name="involved"
              value={filterValue['involved']}
              onChange={(e) => onInputChange(e, 'involved')}
              placeholder={
                t ? t('txns:filter.placeholder') : 'Search by address e.g. Ⓝ..'
              }
              className="border rounded h-8 mb-2 px-2 text-nearblue-600 dark:text-neargray-10 text-xs"
            />
            <div className="flex">
              <button
                type="submit"
                onClick={(e) => onFilter(e, 'involved')}
                className="flex items-center justify-center flex-1 rounded bg-green-500 dark:bg-green-250 dark:text-black h-7 text-white text-xs mr-2"
              >
                <Filter className="h-3 w-3 fill-current mr-2" />{' '}
                {t ? t('txns:filter.filter') : 'Filter'}
              </button>
              <button
                name="involved"
                type="button"
                onClick={() => onClear('involved')}
                className="flex-1 rounded bg-gray-300 dark:bg-black-200 dark:text-white text-xs h-7"
              >
                {t ? t('txns:filter.clear') : 'Clear'}
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
      ),
      key: 'involved_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          {row.involved_account_id ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span
                    className={`inline-block align-bottom text-green-500 dark:text-green-250 whitespace-nowrap p-0.5 px-1 border rounded-md ${
                      row?.involved_account_id === address
                        ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                        : 'text-green-500 dark:text-green-250 border-transparent'
                    }`}
                  >
                    <Link
                      href={`/address/${row.involved_account_id}`}
                      className="hover:no-underline"
                    >
                      <a
                        className="text-green-500 dark:text-green-250 hover:no-underline"
                        onMouseOver={(e) =>
                          onHandleMouseOver(e, row?.involved_account_id)
                        }
                        onMouseLeave={handleMouseLeave}
                      >
                        {truncateString(row.involved_account_id, 15, '...')}
                      </a>
                    </Link>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  align="start"
                  side="bottom"
                >
                  {row.involved_account_id}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            'system'
          )}
        </span>
      ),
      tdClassName:
        'px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10  font-medium',
    },
    {
      header: <>Quantity</>,
      key: 'block_height',
      cell: (row: TransactionInfo) => (
        <span>
          {Number(row?.delta_amount) > 0 ? (
            <div className="text-neargreen flex flex-row items-center">
              {'+' +
                localFormat(
                  tokenAmount(row?.delta_amount, row?.ft?.decimals, true),
                )}
            </div>
          ) : (
            <div className="text-red-500 flex flex-row items-center">
              {row?.delta_amount
                ? localFormat(
                    tokenAmount(row?.delta_amount, row?.ft?.decimals, true),
                  )
                : ''}
            </div>
          )}
        </span>
      ),
      tdClassName:
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10  font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10  uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <>Token</>,
      key: 'block_height',
      cell: (row: TransactionInfo) => {
        return (
          row?.ft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  src={row?.ft?.icon}
                  alt={row?.ft?.name}
                  className="w-4 h-4"
                  appUrl={config.appUrl}
                />
              </span>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="text-sm text-nearblue-600 dark:text-neargray-10  max-w-[110px] inline-block truncate whitespace-nowrap">
                      <Link
                        href={`/token/${row?.ft?.contract}`}
                        className="hover:no-underline"
                      >
                        <a className="text-green-500 dark:text-green-250 font-medium hover:no-underline">
                          {row?.ft?.name}
                        </a>
                      </Link>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                    align="start"
                    side="bottom"
                  >
                    {row?.ft?.name}
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
              {row?.ft?.symbol && (
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="text-sm text-nearblue-700 max-w-[80px] inline-block truncate">
                        &nbsp; {row?.ft.symbol}
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                      align="start"
                      side="bottom"
                    >
                      {row?.ft.symbol}
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}
            </div>
          )
        );
      },
      tdClassName:
        'px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10 font-medium',
      thClassName:
        'px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: (
        <div className="w-full inline-flex px-4 py-4">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={toggleShowAge}
                  className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 dark:text-green-250 focus:outline-none whitespace-nowrap"
                >
                  {showAge
                    ? t
                      ? t('txns:age')
                      : 'AGE'
                    : t
                    ? t('txns:ageDT')
                    : 'DATE TIME (UTC)'}
                  {showAge && (
                    <Clock className="text-green-500 dark:text-green-250 ml-2" />
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
          <button type="button" onClick={onOrder} className="px-2">
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
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
      tdClassName:
        'px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName: 'whitespace-nowrap',
    },
  ];

  return (
    <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
      {isLoading ? (
        <div className="pl-6 max-w-lg w-full py-5 ">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 pl-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
              {Object.keys(tokens).length > 0 &&
                `A total of ${
                  localFormat && localFormat(totalCount.toString())
                }${' '}
              transactions found`}
            </p>
          </div>
          <div className="flex flex-col px-4 text-sm mb-4 text-nearblue-600 dark:text-neargray-10 lg:flex-row lg:ml-auto  lg:items-center lg:justify-between">
            {filters && Object.keys(filters).length > 0 && (
              <div className="flex  px-2 items-center text-sm text-gray-500 mb-2 lg:mb-0">
                <span className="mr-1 lg:mr-2">Filtered By:</span>
                <span className="flex flex-wrap items-center justify-center bg-gray-100 dark:bg-black-200 rounded-full px-3 py-1 space-x-2">
                  {Object.keys(filters).map((key) => (
                    <span
                      className="flex items-center max-sm:mb-1 truncate max-w-[120px]"
                      key={key}
                    >
                      {capitalizeFirstLetter(key)}:{' '}
                      <span className="font-semibold truncate">
                        {filters[key]}
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
            <span className="text-xs text-nearblue-600 dark:text-neargray-10 self-stretch lg:self-auto px-2">
              {Object.keys(tokens).length > 0 && (
                <button className="hover:no-underline ">
                  <Link
                    href={`/token/exportdata?address=${id}`}
                    className="flex items-center text-nearblue-600 dark:text-neargray-10 font-medium py-2 border border-neargray-700 dark:border-black-200 px-4 rounded-md bg-white dark:bg-black-600 hover:bg-neargray-800"
                  >
                    <p>CSV Export</p>
                    <span className="ml-2">
                      <Download />
                    </span>
                  </Link>
                </button>
              )}
            </span>
          </div>
        </div>
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
          Error: (
            <ErrorMessage
              icons={<FaInbox />}
              message={errorMessage}
              mutedText="Please try again later"
            />
          ),
        }}
      />
    </div>
  );
}
