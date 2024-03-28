/**
 * Component: FTTransfers
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Fungible Token Tranfers List.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [id] - The token identifier passed as a string
 * @param {Object.<string, string>} [filters] - Key-value pairs for filtering transactions. (Optional)
 *                                              Example: If provided, method=batch will filter the blocks with method=batch.
 * @param {function} [onFilterClear] - Function to clear a specific or all filters. (Optional)
 *                                   Example: onFilterClear={handleClearFilter} where handleClearFilter is a function to clear the applied filters.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  ownerId: string;
  network: string;
  t: (key: string) => string;
  id: string;
  a?: string;
  filters?: { [key: string]: string };
  onFilterClear?: (name: string) => void;
}

import Skeleton from '@/includes/Common/Skeleton';
import TxnStatus from '@/includes/Common/Status';
import Clock from '@/includes/icons/Clock';
import CloseCircle from '@/includes/icons/CloseCircle';
import FaLongArrowAltRight from '@/includes/icons/FaLongArrowAltRight';
import { TransactionInfo } from '@/includes/types';

export default function ({
  network,
  t,
  id,
  filters,
  onFilterClear,
  ownerId,
}: Props) {
  const {
    capitalizeFirstLetter,
    formatTimestampToString,
    getTimeAgoString,
    localFormat,
  } = VM.require(`${ownerId}/widget/includes.Utils.formats`);

  const { getConfig, handleRateLimit, nanoToMilli } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const { tokenAmount } = VM.require(`${ownerId}/widget/includes.Utils.near`);

  const [showAge, setShowAge] = useState(true);
  const [txnLoading, setTxnLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initialPage = 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [txns, setTxns] = useState<{ [key: number]: TransactionInfo[] }>({});
  const [address, setAddress] = useState('');

  const config = getConfig && getConfig(network);

  const errorMessage = 'No transactions found!';

  const toggleShowAge = () => setShowAge((s) => !s);

  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    function fetchTotalTxns(qs?: string) {
      const queryParams = qs ? '?' + qs : '';
      setTxnLoading(true);
      asyncFetch(`${config?.backendUrl}fts/${id}/txns/count${queryParams}`, {
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
              setTotalCount(resp?.count);
              setTxnLoading(false);
            } else {
              handleRateLimit(data, () => fetchTotalTxns(qs));
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTxnsData(page: number, qs: string) {
      const queryParams = qs ? qs + '&' : '';
      setIsLoading(true);
      asyncFetch(
        `${config?.backendUrl}fts/${id}/txns?${queryParams}page=${page}&per_page=25`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then((data: { body: { txns: TransactionInfo[] }; status: number }) => {
          const resp = data?.body?.txns;
          if (data.status === 200 && Array.isArray(resp) && resp.length > 0) {
            setTxns((prevData) => ({ ...prevData, [page]: resp || [] }));
            setIsLoading(false);
          } else {
            handleRateLimit(data, () => fetchTxnsData(page, qs));
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
    if (config?.backendUrl) {
      fetchTotalTxns(urlString);
      fetchTxnsData(currentPage, urlString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, currentPage, id, filters]);

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
          <TxnStatus status={row?.outcomes?.status} showLabel={false} />
        </>
      ),
      tdClassName: 'pl-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
    },
    {
      header: <span>{t ? t('hash') : 'HASH'}</span>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <>
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
        </>
      ),
      tdClassName: 'px-5 py-4 text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>BLOCK</span>,
      key: 'block.block_height',
      cell: (row: TransactionInfo) => (
        <>
          <Link
            className="hover:no-underline"
            href={`/blocks/${row?.included_in_block_hash}`}
          >
            <a className="text-green-500 font-medium hover:no-underline">
              {row?.block?.block_height
                ? localFormat(row?.block?.block_height)
                : row?.block?.block_height ?? ''}
            </a>
          </Link>
        </>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('type') : 'TYPE'}</span>,
      key: 'cause',
      cell: (row: TransactionInfo) => (
        <>
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
        </>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>Affected</span>,
      key: 'affected_account_id',
      cell: (row: TransactionInfo) => (
        <>
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
        </>
      ),
      tdClassName: 'px-5 py-4 text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: '',
      key: '',
      cell: (row: TransactionInfo) =>
        row?.involved_account_id === row?.affected_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
            {t ? t('txnSelf') : 'Self'}
          </span>
        ) : Number(row?.delta_amount) > 0 ? (
          <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white rotate-180">
            <FaLongArrowAltRight />
          </div>
        ) : (
          <div className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
            <FaLongArrowAltRight />
          </div>
        ),
      tdClassName: 'text-center',
    },
    {
      header: <span>Involved</span>,
      key: 'involved_account_id',
      cell: (row: TransactionInfo) => (
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
      ),
      tdClassName: 'px-5 py-4 text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>Quantity</span>,
      key: 'amount',
      cell: (row: TransactionInfo) => (
        <>
          {row?.delta_amount
            ? localFormat(
                tokenAmount(
                  Big(row.delta_amount).abs().toString(),
                  row?.ft?.decimals,
                  true,
                ),
              )
            : ''}
        </>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: (
        <>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={toggleShowAge}
                  className="text-left text-xs px-5 py-4 w-full flex items-center font-semibold uppercase tracking-wider text-green-500 focus:outline-none flex-row whitespace-nowrap"
                >
                  {showAge ? (
                    <>
                      {t ? t('token:fts.age') : 'AGE'}
                      <Clock className="text-green-500 ml-2" />
                    </>
                  ) : (
                    <> {t ? t('token:fts.ageDT') : 'DATE TIME (UTC)'}</>
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
        </>
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
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
    },
  ];

  return (
    <>
      {txnLoading ? (
        <div className="pl-3 max-w-sm py-5 h-[60px]">
          <Skeleton className="h-4" />
        </div>
      ) : (
        <div className={`flex flex-col lg:flex-row pt-4`}>
          <div className="flex flex-col">
            <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600">
              A total of {localFormat && localFormat(totalCount.toString())}{' '}
              transactions found
            </p>
          </div>
          <div className=" flex items-center px-2 text-sm mb-4 text-nearblue-600 lg:ml-auto">
            {filters && Object?.keys(filters)?.length > 0 && (
              <div className="flex items-center px-2 text-sm text-gray-500 lg:ml-auto">
                Filtered By:
                <span className="flex items-center bg-gray-100 rounded-full px-3 py-1 ml-1 space-x-2">
                  {filters &&
                    Object?.keys(filters)?.map((key) => (
                      <span className="flex" key={key}>
                        {capitalizeFirstLetter(key)}:{' '}
                        <span className="inline-block truncate max-w-[120px]">
                          <span className="font-semibold">{filters[key]}</span>
                        </span>
                      </span>
                    ))}
                  <CloseCircle
                    className="w-4 h-4 fill-current cursor-pointer"
                    onClick={onFilterClear}
                  />
                </span>
              </div>
            )}
          </div>
        </div>
      )}
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
    </>
  );
}
