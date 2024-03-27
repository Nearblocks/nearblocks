/**
 * Component: TransactionsList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Table of Transactions on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 * @param {Object.<string, string>} [filters] - Key-value pairs for filtering transactions. (Optional)
 *                                              Example: If provided, method=batch will filter the blocks with method=batch.
 * @param {function} [handleFilter] - Function to handle filter changes. (Optional)
 *                                    Example: handleFilter={handlePageFilter} where handlePageFilter is a function to filter the page.
 * @param {function} [onFilterClear] - Function to clear a specific or all filters. (Optional)
 *                                   Example: onFilterClear={handleClearFilter} where handleClearFilter is a function to clear the applied filters.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string, options?: { count?: string }) => string;
  currentPage: number;
  setPage: (page: number) => void;
  filters: { [key: string]: string };
  handleFilter: (name: string, value: string) => void;
  onFilterClear: (name: string) => void;
}

import FaLongArrowAltRight from '@/includes/icons/FaLongArrowAltRight';
import TxnStatus from '@/includes/Common/Status';
import Filter from '@/includes/Common/Filter';
import { TransactionInfo } from '@/includes/types';
import SortIcon from '@/includes/icons/SortIcon';
import CloseCircle from '@/includes/icons/CloseCircle';
import Skeleton from '@/includes/Common/Skeleton';
import Clock from '@/includes/icons/Clock';

export default function (props: Props) {
  const {
    network,
    currentPage,
    filters,
    setPage,
    handleFilter,
    onFilterClear,
    t,
    ownerId,
  } = props;

  const { txnMethod } = VM.require(`${ownerId}/widget/includes.Utils.near`);

  const {
    localFormat,
    getTimeAgoString,
    formatTimestampToString,
    capitalizeFirstLetter,
  } = VM.require(`${ownerId}/widget/includes.Utils.formats`);

  const {
    getConfig,
    handleRateLimit,
    nanoToMilli,
    truncateString,
    yoctoToNear,
  } = VM.require(`${ownerId}/widget/includes.Utils.libs`);

  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [txns, setTxns] = useState<{ [key: number]: TransactionInfo[] }>({});
  const [showAge, setShowAge] = useState(true);
  const [sorting, setSorting] = useState('desc');
  const [address, setAddress] = useState('');
  const [filterValue, setFilterValue] = useState<Record<string, string>>({});
  const errorMessage = t ? t('txns:noTxns') : ' No transactions found!';

  const config = getConfig && getConfig(network);

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
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTxnsData(qs: string, sqs: string, page: number) {
      setIsLoading(true);
      const queryParams = qs ? qs + '&' : '';
      asyncFetch(
        `${config?.backendUrl}txns?${queryParams}order=${sqs}&page=${page}&per_page=25`,
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
              setIsLoading(false);
            }
          } else {
            handleRateLimit(
              data,
              () => fetchTxnsData(qs, sorting, page),
              () => setIsLoading(false),
            );
          }
        })
        .catch(() => {})
        .finally(() => {});
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, currentPage, filters, sorting]);

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
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => (
        <>
          <TxnStatus status={row?.outcomes?.status} showLabel={false} />
        </>
      ),
      tdClassName: 'pl-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
    },
    {
      header: <span>{t ? t('txns:hash') : 'TXN HASH'}</span>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="truncate max-w-[120px] inline-block align-bottom whitespace-nowrap text-green-500">
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
        'px-5 py-4 text-left whitespace-nowrap  text-xs font-semibold text-nearblue-600 uppercase tracking-wider',
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
            className="bg-white shadow-lg border rounded-b-lg p-2 z-50"
            sideOffset={5}
          >
            <div className="flex flex-col">
              <input
                name="method"
                value={filterValue['method']}
                onChange={(e) => onInputChange(e, 'method')}
                placeholder="Search by method"
                className="border rounded h-8 mb-2 px-2 text-nearblue-600 text-xs"
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
                <span className="bg-blue-900/10 text-xs text-nearblue-600 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
                  <span className="block truncate">
                    {txnMethod(row?.actions, t)}
                  </span>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
                side="bottom"
              >
                {txnMethod(row?.actions, t)}
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
          {row?.actions_agg?.deposit
            ? yoctoToNear(row?.actions_agg?.deposit, true)
            : row?.actions_agg?.deposit ?? ''}{' '}
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
          {row?.outcomes_agg?.transaction_fee
            ? yoctoToNear(row?.outcomes_agg?.transaction_fee, true)
            : row?.outcomes_agg?.transaction_fee ?? ''}{' '}
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
            className="bg-white shadow-lg border rounded-b-lg p-2 z-50"
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
      key: 'signer_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span
                  className={`truncate max-w-[120px] inline-block align-bottom text-green-500 whitespace-nowrap ${
                    row?.signer_account_id === address
                      ? ' rounded-md bg-[#FFC10740] border-[#FFC10740] border border-dashed p-0.5 px-1 -m-[1px] cursor-pointer text-[#033F40]'
                      : 'text-green-500 p-0.5 px-1'
                  }`}
                >
                  <Link
                    href={`/address/${row?.signer_account_id}`}
                    className="hover:no-underline"
                  >
                    <a
                      className={` hover:no-underline `}
                      onMouseOver={(e) =>
                        onHandleMouseOver(e, row?.signer_account_id)
                      }
                      onMouseLeave={handleMouseLeave}
                    >
                      {row?.signer_account_id}
                    </a>
                  </Link>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {row?.signer_account_id}
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
            className="bg-white shadow-lg border rounded-b-lg p-2 z-50"
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
                <span>
                  <Link
                    href={`/address/${row?.receiver_account_id}`}
                    className="hover:no-underline whitespace-nowrap"
                  >
                    <a
                      className={`text-green-500 hover:no-underline ${
                        row?.receiver_account_id === address
                          ? ' rounded-md bg-[#FFC10740] border-[#FFC10740] border border-dashed p-1 -m-[1px] cursor-pointer text-[#033F40]'
                          : 'text-green-500 p-1'
                      }`}
                      onMouseOver={(e) =>
                        onHandleMouseOver(e, row?.receiver_account_id)
                      }
                      onMouseLeave={handleMouseLeave}
                    >
                      {truncateString(row?.receiver_account_id, 17, '...')}
                    </a>
                  </Link>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {row?.receiver_account_id}
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
            href={`/blocks/${row?.included_in_block_hash}`}
            className="hover:no-underline"
          >
            <a className="text-green-500 hover:no-underline">
              {row?.block?.block_height
                ? localFormat(row?.block?.block_height)
                : row?.block?.block_height ?? ''}
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
                  className="text-left text-xs w-full flex items-center font-semibold uppercase tracking-wider  text-green-500 focus:outline-none whitespace-nowrap"
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
      thClassName: 'inline-flex whitespace-nowrap',
    },
  ];

  return (
    <div className=" bg-white border soft-shadow rounded-xl overflow-hidden">
      {isLoading ? (
        <div className="pl-6 max-w-lg w-full py-5 ">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 pl-6 text-sm mb-4 text-nearblue-600">
              {t
                ? t('txns:listing', {
                    count: localFormat && localFormat(totalCount.toString()),
                  })
                : `More than > ${totalCount} transactions found`}
            </p>
          </div>
          {filters && Object.keys(filters).length > 0 && (
            <div className="flex items-center px-6 text-sm mb-4 text-nearblue-600 lg:ml-auto">
              Filtered By:
              <span className="flex flex-wrap items-center justify-center bg-gray-100 rounded-full px-3 py-1 space-x-2">
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
        </div>
      )}
      {
        <Widget
          src={`${ownerId}/widget/bos-components.components.Shared.Table`}
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
