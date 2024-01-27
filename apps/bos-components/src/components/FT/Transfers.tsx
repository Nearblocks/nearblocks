/**
 * Component: FTTransfers
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Fungible Token Tranfers List.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} id - The token identifier passed as a string
 */

interface Props {
  network: string;
  id: string;
  t: (key: string) => string;
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
import { getConfig, nanoToMilli } from '@/includes/libs';
import { tokenAmount } from '@/includes/near';
import { TransactionInfo } from '@/includes/types';

export default function ({ network, id, t }: Props) {
  const [showAge, setShowAge] = useState(true);
  const [txnLoading, setTxnLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initialPage = 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [txns, setTxns] = useState<{ [key: number]: TransactionInfo[] }>({});
  const config = getConfig(network);
  const errorMessage = 'No transactions found!';

  const toggleShowAge = () => setShowAge((s) => !s);

  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    function fetchTotalTxns() {
      setTxnLoading(true);
      asyncFetch(`${config?.backendUrl}fts/${id}/txns/count`, {
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
            }
            setTxnLoading(false);
          },
        )
        .catch(() => {})
        .finally(() => {});
    }

    function fetchTxnsData(page: number) {
      setIsLoading(true);

      asyncFetch(
        `${config?.backendUrl}fts/${id}/txns?&page=${page}&per_page=25`,
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
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoading(false);
        });
    }

    fetchTotalTxns();
    fetchTxnsData(currentPage);
  }, [config?.backendUrl, currentPage, id]);

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
        'pl-5 pr-2 py-4 whitespace-nowrap text-sm text-nearblue-600  flex justify-end',
    },
    {
      header: <span>{t ? t('hash') : 'HASH'}</span>,
      key: 'transaction_hash',
      cell: (row: TransactionInfo) => (
        <>
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
        </>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>BLOCK</span>,
      key: 'block.block_height',
      cell: (row: TransactionInfo) => (
        <>
          <a
            className="hover:no-underline"
            href={`/blocks/${row.included_in_block_hash}`}
          >
            <a className="text-green-500 font-medium hover:no-underline">
              {localFormat(row.block.block_height)}
            </a>
          </a>
        </>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('type') : 'TYPE'}</span>,
      key: 'event_kind',
      cell: (row: TransactionInfo) => (
        <>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className="bg-blue-900/10 text-xs text-nearblue-600 rounded-xl px-2 py-1 max-w-[120px] inline-flex truncate">
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
        </>
      ),
      tdClassName: 'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>{t ? t('token:fts.from') : 'FROM'}</span>,
      key: 'token_old_owner_account_id',
      cell: (row: TransactionInfo) => (
        <>
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
                  align="center"
                  side="bottom"
                >
                  {row.token_old_owner_account_id}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            'system'
          )}
        </>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: '',
      key: '',
      cell: (row: TransactionInfo) =>
        row.token_old_owner_account_id === row.token_new_owner_account_id ? (
          <span className="uppercase rounded w-10 py-2 h-6 inline-flex items-center justify-center bg-green-200 text-white text-sm font-semibold">
            {t ? t('txnSelf') : 'Self'}
          </span>
        ) : (
          <span className="w-5 h-5 p-1 bg-green-100 rounded-full text-center flex justify-center items-center mx-auto text-white">
            <FaLongArrowAltRight />
          </span>
        ),
      tdClassName: 'text-center',
    },
    {
      header: <span>{t ? t('to') : 'TO'}</span>,
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
                  align="center"
                  side="bottom"
                >
                  {row.token_new_owner_account_id}
                </Tooltip.Content>
              </Tooltip.Root>
            </Tooltip.Provider>
          ) : (
            'system'
          )}
        </span>
      ),
      tdClassName:
        'px-5 py-4 whitespace-nowrap text-sm text-nearblue-600 font-medium',
      thClassName:
        'px-5 py-4 text-left text-xs font-semibold text-nearblue-600 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>Quantity</span>,
      key: 'amount',
      cell: (row: TransactionInfo) => (
        <>{tokenAmount(row.amount, row.ft?.decimals, true)}</>
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
                    ? formatTimestampToString(nanoToMilli(row.block_timestamp))
                    : getTimeAgoString(nanoToMilli(row.block_timestamp))}
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content
                className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="center"
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
              A total of {localFormat(totalCount)} transactions found
            </p>
          </div>
        </div>
      )}
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
    </>
  );
}
