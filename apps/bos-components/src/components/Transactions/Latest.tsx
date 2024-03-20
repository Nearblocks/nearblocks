/**
 * Component: TransactionsLatest
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Latest Transactions on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 */

interface Props {
  network: string;
  t: (key: string) => string | undefined;
}

import Skeleton from '@/includes/Common/Skeleton';
import { getTimeAgoString, shortenHex } from '@/includes/formats';
import {
  getConfig,
  handleRateLimit,
  nanoToMilli,
  shortenAddress,
  yoctoToNear,
} from '@/includes/libs';
import { TransactionInfo } from '@/includes/types';

export default function ({ t, network }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [txns, setTxns] = useState<TransactionInfo[]>([]);

  const config = getConfig(network);

  useEffect(() => {
    let delay = 5000;

    function fetchLatestTxns() {
      asyncFetch(`${config.backendUrl}txns/latest`)
        .then(
          (data: {
            body: {
              txns: TransactionInfo[];
            };
            status: number;
          }) => {
            const resp = data?.body?.txns;
            if (data.status === 200) {
              setTxns(resp);
              setError(false);
              if (isLoading) setIsLoading(false);
            } else {
              handleRateLimit(data, fetchLatestTxns, () => {
                if (isLoading) setIsLoading(false);
              });
            }
          },
        )
        .catch(() => {
          setError(true);
        });
    }
    fetchLatestTxns();

    const interval = setInterval(fetchLatestTxns, delay);

    return () => clearInterval(interval);
  }, [config.backendUrl, isLoading]);

  return (
    <>
      <div className="relative">
        <ScrollArea.Root>
          <ScrollArea.Viewport>
            {!txns && error && (
              <div className="flex items-center h-16 mx-3 py-2 text-nearblue-700 text-xs">
                {t ? t('home:error') : ' Error!'}
              </div>
            )}
            {!error && !isLoading && txns?.length === 0 && (
              <div className="flex items-center h-16 mx-3 py-2 text-nearblue-700 text-xs">
                {t ? t('home:noTxns') : ' No transactions found!'}
              </div>
            )}
            {isLoading && txns?.length === 0 && (
              <div className="px-3 divide-y h-80">
                {[...Array(5)].map((_, i) => (
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 py-3"
                    key={i}
                  >
                    <div className="flex items-center ">
                      <div className="flex-shrink-0 rounded-full h-10 w-10 bg-blue-900/10 flex items-center justify-center text-sm">
                        TX
                      </div>
                      <div className="px-2">
                        <div className="text-green-500 text-sm">
                          <div className="h-5 w-14">
                            <Skeleton className="h-4" />
                          </div>
                        </div>
                        <div className="text-nearblue-700 text-xs">
                          <div className="h-4 w-24">
                            <Skeleton className="h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 px-2 order-2 md:order-1 text-sm">
                      <div className="h-5 w-36">
                        <Skeleton className="h-4" />
                      </div>
                      <div className="text-nearblue-700 text-sm">
                        <div className="h-5 w-14">
                          <Skeleton className="h-4" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right order-1 md:order-2">
                      <div className="ml-auto w-32">
                        <Skeleton className="h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {txns?.length > 0 && (
              <div className="px-3 divide-y h-80">
                {txns?.map((txn) => {
                  return (
                    <div
                      className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3 py-3"
                      key={txn?.transaction_hash}
                    >
                      <div className=" flex items-center">
                        <div className="flex-shrink-0 rounded-full h-10 w-10 bg-blue-900/10 flex items-center justify-center text-sm">
                          TX
                        </div>
                        <div className="overflow-hidden pl-2">
                          <div className="text-green-500 text-sm  ">
                            <Link
                              href={`/txns/${txn?.transaction_hash}`}
                              className="hover:no-underline"
                            >
                              <a className="text-green-500 font-medium hover:no-underline">
                                {shortenHex(txn?.transaction_hash ?? '')}
                              </a>
                            </Link>
                          </div>
                          <div className="text-gray-400 text-xs truncate">
                            {txn?.block_timestamp
                              ? getTimeAgoString(
                                  nanoToMilli(txn?.block_timestamp),
                                )
                              : ''}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 md:col-span-1 px-2 order-2 md:order-1 text-sm">
                        <div className="whitespace-nowrap truncate">
                          {t ? t('home:txnFrom') : 'From'}{' '}
                          <Link
                            href={`/address/${txn?.signer_account_id}`}
                            className="hover:no-underline"
                          >
                            <a className="text-green-500  font-medium hover:no-underline">
                              {shortenAddress(txn?.signer_account_id ?? '')}
                            </a>
                          </Link>
                        </div>
                        <div className="whitespace-nowrap truncate">
                          {t ? t('home:txnTo') : 'To'}{' '}
                          <Link
                            href={`/address/${txn?.receiver_account_id}`}
                            className="hover:no-underline"
                          >
                            <a className="text-green-500 font-medium hover:no-underline">
                              {shortenAddress(txn?.receiver_account_id ?? '')}
                            </a>
                          </Link>
                        </div>
                      </div>
                      <div className="text-right order-1 md:order-2 overflow-hidden">
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <span className="u-label--badge-in  text-nearblue-700 truncate">
                                {txn?.actions_agg?.deposit
                                  ? yoctoToNear(txn?.actions_agg?.deposit, true)
                                  : txn?.actions_agg?.deposit ?? ''}{' '}
                                Ⓝ
                              </span>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                              sideOffset={5}
                            >
                              Deposit value
                            </Tooltip.Content>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-neargray-25 transition-colors duration-[160ms] ease-out hover:bg-neargray-25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="flex-1 bg-neargray-50 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-neargray-25 transition-colors duration-[160ms] ease-out hover:bg-neargray-25 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
            orientation="horizontal"
          >
            <ScrollArea.Thumb className="flex-1 bg-neargray-50 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner className="bg-neargray-50" />
        </ScrollArea.Root>
      </div>
      {isLoading && txns.length === 0 && (
        <div className="border-t px-2 py-3 text-nearblue-600">
          <Skeleton className="h-10" />
        </div>
      )}
      {txns && txns?.length > 0 && (
        <div className="border-t px-2 py-3 text-nearblue-600">
          <Link href="/txns">
            <a className="block text-center border border-green-900/10 font-thin bg-green-500 hover:bg-green-400 text-white text-xs py-3 rounded w-full focus:outline-none hover:no-underline">
              View all transactions
            </a>
          </Link>
        </div>
      )}
    </>
  );
}
