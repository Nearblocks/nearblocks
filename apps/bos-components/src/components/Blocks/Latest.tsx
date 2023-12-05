/**
 * Component : LatestBlocks
 * Author: Nearblocks Pte Ltd
 * License : Business Source License 1.1
 * Description: Latest Blocks on Near Protocol.
 */

import {
  convertToMetricPrefix,
  getTimeAgoString,
  localFormat,
} from '@/includes/formats';
import { getConfig, nanoToMilli } from '@/includes/libs';
import { BlocksInfo } from '@/includes/types';

export default function () {
  const [isLoading, setIsLoading] = useState(false);
  const [blocks, setBlocks] = useState<BlocksInfo[]>([]);

  const config = getConfig(context.networkId);

  const Loader = (props: { className?: string; wrapperClassName?: string }) => {
    return (
      <div
        className={`bg-gray-200 h-5 rounded shadow-sm animate-pulse ${props.className}`}
      ></div>
    );
  };

  useEffect(() => {
    function fetchLatestBlocks() {
      setIsLoading(true);
      asyncFetch(`${config.backendUrl}blocks/latest`).then(
        (data: {
          body: {
            blocks: BlocksInfo[];
          };
        }) => {
          const resp = data?.body?.blocks;
          setBlocks(resp);
        },
      );
      setIsLoading(false);
    }

    fetchLatestBlocks();
  }, [config.backendUrl]);

  return (
    <>
      <div className="relative">
        <ScrollArea.Root>
          <ScrollArea.Viewport>
            {!blocks && (
              <div className="flex items-center h-16 mx-3 py-2 text-gray-400 text-xs">
                Error!
              </div>
            )}
            {!isLoading && blocks.length === 0 && (
              <div className="flex items-center h-16 mx-3 py-2 text-gray-400 text-xs">
                No blocks found
              </div>
            )}
            {isLoading && (
              <div className="px-3 divide-y h-80">
                {[...Array(10)].map((_, i) => (
                  <div
                    className="grid grid-cols-2 md:grid-cols-3 gap-3 py-3"
                    key={i}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-lg h-10 w-10 bg-blue-900/10 flex items-center justify-center text-sm">
                        BK
                      </div>
                      <div className="px-2">
                        <div className="text-green-500 text-sm">
                          <Loader className="h-4" wrapperClassName="h-5 w-14" />
                        </div>
                        <div className="text-gray-400 text-xs">
                          <Loader className="h-3" wrapperClassName="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1 px-2 order-2 md:order-1 text-sm">
                      <Loader className="h-4" wrapperClassName="h-5 w-36" />
                      <div className="text-gray-400 text-sm">
                        <Loader className="h-4" wrapperClassName="h-5 w-14" />
                      </div>
                    </div>
                    <div className="text-right order-1 md:order-2">
                      <Loader wrapperClassName="ml-auto w-32" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {blocks.length > 0 && (
              <div className="px-3 divide-y h-80">
                {blocks.map((block) => {
                  return (
                    <div
                      className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3 py-3"
                      key={block.block_hash}
                    >
                      <div className=" flex items-center">
                        <div className="flex-shrink-0 rounded-lg h-10 w-10 bg-blue-900/10 flex items-center justify-center text-sm">
                          BK
                        </div>
                        <div className="overflow-hidden pl-2">
                          <div className="text-green-500 text-sm font-medium ">
                            <a href={`/blocks/${block.block_hash}`}>
                              <a className="text-green-500">
                                {localFormat(block.block_height)}
                              </a>
                            </a>
                          </div>
                          <div className="text-gray-400 text-xs truncate">
                            {getTimeAgoString(
                              nanoToMilli(block.block_timestamp),
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 md:col-span-1 px-2 order-2 md:order-1 text-sm whitespace-nowrap truncate">
                        Author{' '}
                        <a href={`/address/${block.author_account_id}`}>
                          <a className="text-green-500  font-medium">
                            {block.author_account_id}
                          </a>
                        </a>
                        <div className="text-gray-400 text-sm ">
                          {localFormat(block?.transactions_agg.count || 0)} txns{' '}
                        </div>
                      </div>
                      <div className="text-right order-1 md:order-2 overflow-hidden">
                        <Tooltip.Provider>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 text-gray-400 truncate">
                                {block.chunks_agg.gas_used
                                  ? convertToMetricPrefix(
                                      block.chunks_agg.gas_used,
                                    )
                                  : '0 '}
                                gas
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
            className="flex select-none touch-none p-0.5 bg-gray-400 transition-colors duration-[160ms] ease-out hover:bg-blend-darken data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="flex-1 bg-gray-400 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-gray-400 transition-colors duration-[160ms] ease-out hover:bg-blend-darken data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
            orientation="horizontal"
          >
            <ScrollArea.Thumb className="flex-1 bg-gray-400 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner className="bg-black-500" />
        </ScrollArea.Root>
      </div>
      {isLoading && (
        <div className="border-t px-2 py-3 text-gray-700">
          <Loader className="h-10" />
        </div>
      )}
      {blocks && blocks.length > 0 && (
        <div className="border-t px-2 py-3 text-gray-700">
          <a href="/blocks">
            <a className="block text-center border border-green-900/10 bg-green-500 hover:bg-green-400 font-thin text-white text-xs py-3 rounded w-full focus:outline-none hover:no-underline">
              View all blocks
            </a>
          </a>
        </div>
      )}
    </>
  );
}
