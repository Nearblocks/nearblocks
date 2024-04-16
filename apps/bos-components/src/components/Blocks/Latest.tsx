/**
 * Component: BlocksLatest
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Latest Blocks on Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  network: string;
  ownerId: string;
  t: (key: string) => string | undefined;
}

import Skeleton from '@/includes/Common/Skeleton';
import { BlocksInfo } from '@/includes/types';

export default function ({ network, t, ownerId }: Props) {
  const { convertToMetricPrefix, getTimeAgoString, localFormat } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );

  const { getConfig, handleRateLimit, nanoToMilli } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [blocks, setBlocks] = useState<BlocksInfo[]>([]);

  const config = getConfig && getConfig(network);

  useEffect(() => {
    let delay = 5000;

    function fetchLatestBlocks() {
      asyncFetch(`${config?.backendUrl}blocks/latest`)
        .then((data: { body: { blocks: BlocksInfo[] }; status: number }) => {
          const resp = data?.body?.blocks;
          if (data.status === 200) {
            setBlocks(resp);
            setError(false);
            if (isLoading) setIsLoading(false);
          } else {
            handleRateLimit(data, fetchLatestBlocks, () => {
              if (isLoading) setIsLoading(false);
            });
          }
        })
        .catch(() => {
          setError(true);
        });
    }

    if (config.backendUrl) {
      fetchLatestBlocks();
    }
    const interval = setInterval(fetchLatestBlocks, delay);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.backendUrl, isLoading]);

  return (
    <>
      <div className="relative">
        <ScrollArea.Root>
          <ScrollArea.Viewport>
            {!blocks && error && (
              <div className="flex items-center h-16 mx-3 py-2 text-nearblue-700 text-xs">
                {t ? t('home:error') : 'Error!'}
              </div>
            )}
            {!error && !isLoading && blocks?.length === 0 && (
              <div className="flex items-center h-16 mx-3 py-2 text-nearblue-700 text-xs">
                {t ? t('home:noBlocks') : 'No blocks found'}
              </div>
            )}
            {isLoading && blocks?.length === 0 && (
              <div className="px-3 divide-y dark:divide-black-200 h-80">
                {[...Array(5)].map((_, i) => (
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 py-3"
                    key={i}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-xl h-10 w-10 bg-blue-900/10 dark:text-white flex items-center justify-center text-sm">
                        BK
                      </div>
                      <div className="px-2">
                        <div className="text-green-500 dark:text-green-250 text-sm">
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
            {blocks?.length > 0 && (
              <div className="px-3 divide-y dark:divide-black-200 h-80">
                {blocks?.map((block) => {
                  return (
                    <div
                      className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3 py-3"
                      key={block?.block_hash}
                    >
                      <div className=" flex items-center">
                        <div className="flex-shrink-0 rounded-xl h-10 w-10 bg-blue-900/10 dark:text-white  flex items-center justify-center text-sm">
                          BK
                        </div>
                        <div className="overflow-hidden pl-2">
                          <div className="text-green-500 dark:text-green-250 text-sm font-medium ">
                            <Link
                              href={`/blocks/${block?.block_hash}`}
                              className="hover:no-underline"
                            >
                              <a className="text-green-500 dark:text-green-250 hover:no-underline">
                                {block?.block_height
                                  ? localFormat(block?.block_height)
                                  : block?.block_height ?? ''}
                              </a>
                            </Link>
                          </div>
                          <div className="text-nearblue-700 text-xs truncate">
                            {block?.block_timestamp
                              ? getTimeAgoString(
                                  nanoToMilli(block?.block_timestamp),
                                )
                              : ''}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 md:col-span-1 px-2 order-2 md:order-1 dark:text-white text-sm whitespace-nowrap truncate">
                        {t ? t('home:blockMiner') : 'Author'}{' '}
                        <Link
                          href={`/address/${block?.author_account_id}`}
                          className="hover:no-underline"
                        >
                          <a className="text-green-500  dark:text-green-250 font-medium hover:no-underline">
                            {block?.author_account_id}
                          </a>
                        </Link>
                        <div className="text-nearblue-700 text-sm ">
                          {block?.transactions_agg?.count
                            ? localFormat(block?.transactions_agg?.count)
                            : block?.transactions_agg?.count ?? ''}{' '}
                          txns{' '}
                        </div>
                      </div>
                      <div className="text-right order-1 md:order-2 overflow-hidden">
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <span className="u-label--badge-in text-nearblue-700 truncate">
                                {block?.chunks_agg?.gas_used
                                  ? convertToMetricPrefix(
                                      block?.chunks_agg?.gas_used,
                                    ) + 'gas'
                                  : block?.chunks_agg?.gas_used ?? '' + 'gas'}
                              </span>
                            </Tooltip.Trigger>
                            <Tooltip.Content
                              className="h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
                              sideOffset={5}
                            >
                              Gas used
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
      {isLoading && blocks?.length === 0 && (
        <div className="border-t dark:border-black-200 px-2 py-3 text-nearblue-600">
          <Skeleton className="h-10" />
        </div>
      )}
      {blocks && blocks?.length > 0 && (
        <div className="border-t dark:border-black-200 px-2 py-3 text-nearblue-600">
          <Link href="/blocks">
            <a className="block  dark:text-black text-center border border-green-900/10 bg-green-500 dark:bg-green-250 hover:bg-green-400 font-thin text-white text-xs py-3 rounded w-full focus:outline-none hover:no-underline">
              View all blocks
            </a>
          </Link>
        </div>
      )}
    </>
  );
}
