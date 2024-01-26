/**
 * Component: FTTransfersList
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Tokens transfers list on Near Protocol.
 * @interface Props
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 */
interface Props {
  network: string;
  t: (key: string, options?: { count?: string | undefined }) => string;
  currentPage: number;
  setPage: (page: number) => void;
}

import Skeleton from '@/includes/Common/Skeleton';
import TxnStatus from '@/includes/Common/Status';
import {
  formatTimestampToString,
  getTimeAgoString,
  localFormat,
} from '@/includes/formats';
import Clock from '@/includes/icons/Clock';
import FaLongArrowAltRight from '@/includes/icons/FaLongArrowAltRight';
import TokenImage from '@/includes/icons/TokenImage';
import { getConfig, nanoToMilli } from '@/includes/libs';
import { tokenAmount } from '@/includes/near';
import { TransactionInfo } from '@/includes/types';

export default function ({ network, t, currentPage, setPage }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showAge, setShowAge] = useState(true);
  const errorMessage = t ? t('noTxns') : 'No transactions found!';
  const [tokens, setTokens] = useState<{ [key: number]: TransactionInfo[] }>(
    {},
  );

  const config = getConfig(network);

  useEffect(() => {
    function fetchTotalTokens() {
      asyncFetch(`${config?.backendUrl}fts/txns/count`, {
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
              setTotalCount(resp?.count | 0);
            }
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTokens(page: number) {
      setIsLoading(true);
      asyncFetch(`${config?.backendUrl}fts/txns?page=${page}&per_page=25`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(
          (data: {
            body: {
              txns: TransactionInfo[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns;
            if (data.status === 200) {
              setTokens((prevData) => ({ ...prevData, [page]: resp || [] }));
            }
          },
        )
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }

    fetchTotalTokens();
    fetchTokens(currentPage);
  }, [config?.backendUrl, currentPage]);

  const toggleShowAge = () => setShowAge((s) => !s);

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
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-gray-500 flex justify-end',
    },
    {
      header: <span>{t ? t('hash') : 'HASH'}</span>,
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
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span> {t ? t('type') : 'TYPE'}</span>,
      key: 'actions',
      cell: (row: TransactionInfo) => (
        <span>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="bg-blue-900/10 text-xs text-gray-500 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
                  <span className="block truncate">{row.event_kind}</span>
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
                side="bottom"
              >
                {row.event_kind}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span>{t ? t('from') : 'FROM'}</span>,
      key: 'signer_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          {row.token_old_owner_account_id ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                    <a
                      href={`/address/${row.token_old_owner_account_id}`}
                      className="hover:no-underline"
                    >
                      <a className="text-green-500 hover:no-underline">
                        {row.token_old_owner_account_id}
                      </a>
                    </a>
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Content
                  className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                  align="start"
                  side="bottom"
                >
                  {row.token_old_owner_account_id}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            'system'
          )}
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span></span>,
      key: '',
      cell: (row: TransactionInfo) => {
        return row.token_old_owner_account_id ===
          row.token_new_owner_account_id ? (
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
      header: <span>{t ? t('to') : 'To'}</span>,
      key: 'receiver_account_id',
      cell: (row: TransactionInfo) => (
        <span>
          {row.token_new_owner_account_id ? (
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <span className="truncate max-w-[120px] inline-block align-bottom text-green-500">
                    <a
                      href={`/address/${row.token_new_owner_account_id}`}
                      className="hover:no-underline"
                    >
                      <a className="text-green-500 hover:no-underline">
                        {row.token_new_owner_account_id}
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
          ) : (
            'system'
          )}
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span> Quantity</span>,
      key: 'block_height',
      cell: (row: TransactionInfo) => (
        <span>{tokenAmount(Number(row.amount), row.ft?.decimals, true)}</span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: <span>Token</span>,
      key: 'block_height',
      cell: (row: TransactionInfo) => {
        return (
          row.ft && (
            <div className="flex flex-row items-center">
              <span className="inline-flex mr-1">
                <TokenImage
                  src={row.ft?.icon}
                  alt={row.ft?.name}
                  className="w-4 h-4"
                  appUrl={config.appUrl}
                />
              </span>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="text-sm text-gray-500 max-w-[110px] inline-block truncate">
                      <a
                        href={`/token/${row.ft?.contract}`}
                        className="hover:no-underline"
                      >
                        <a className="text-green-500 font-medium hover:no-underline">
                          {row.ft?.name}
                        </a>
                      </a>
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                    align="start"
                    side="bottom"
                  >
                    {row.ft?.name}
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
              {row.ft?.symbol && (
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className="text-sm text-gray-400 max-w-[80px] inline-block truncate">
                        &nbsp; {row.ft.symbol}
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                      className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                      align="start"
                      side="bottom"
                    >
                      {row.ft.symbol}
                    </Tooltip.Content>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}
            </div>
          )
        );
      },
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-gray-500 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
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
                      ? t('age')
                      : 'AGE'
                    : t
                    ? t('ageDT')
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
                    ? formatTimestampToString(nanoToMilli(row.block_timestamp))
                    : getTimeAgoString(nanoToMilli(row.block_timestamp))}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="bottom"
              >
                {showAge
                  ? formatTimestampToString(nanoToMilli(row.block_timestamp))
                  : getTimeAgoString(nanoToMilli(row.block_timestamp))}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </span>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-gray-500',
      thClassName: 'inline-flex whitespace-nowrap',
    },
  ];

  return (
    <>
      <div className="bg-white border soft-shadow rounded-xl pb-1">
        {isLoading ? (
          <div className="max-w-lg w-full pl-3 py-5">
            <Skeleton className="h-4" />
          </div>
        ) : (
          <div className={`flex flex-col lg:flex-row pt-4`}>
            <div className="flex flex-col">
              <p className="leading-7 px-6 text-sm mb-4 text-gray-500">
                A total of {localFormat(totalCount)} transactions found
              </p>
            </div>
          </div>
        )}
        <Widget
          src={`${config.ownerId}/widget/bos-components.components.Shared.Table`}
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
            Error: errorMessage,
          }}
        />
      </div>
    </>
  );
}
