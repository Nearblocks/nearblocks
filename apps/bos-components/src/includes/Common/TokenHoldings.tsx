/**
 * @interface Props
 * @param {string} [id] - Optional identifier for the account, passed as a string.
 * @param {boolean} [loading] - Flag indicating whether data is currently loading.
 * @param {boolean} [inventoryLoading] - Flag indicating whether inventory data is currently loading.
 * @param {InventoryInfo} [data] - Information related to the inventory.
 * @param {Object} [ft] - Object containing details about the tokens.
 * @param {string} [ft.amount] -  amount in USD of tokens.
 * @param {Object[]} [ft.tokens] - Array containing 'TokenListInfo' objects, providing information about individual token details.
 * @param {string} [appUrl] - The URL of the application.
 * @param {string} ownerId - The identifier of the owner of the component.
 */
import ArrowDown from '@/includes/icons/ArrowDown';
import { InventoryInfo, TokenListInfo } from '@/includes/types';

interface Props {
  id?: string;
  loading?: boolean;
  inventoryLoading?: boolean;
  data: InventoryInfo;
  ft: {
    amount: string;
    tokens: TokenListInfo[];
  };
  appUrl?: string;
  ownerId: string;
}

const TokenHoldings = (props: Props) => {
  const { dollarFormat, localFormat } = VM.require(
    `${props.ownerId}/widget/includes.Utils.formats`,
  );

  const { truncateString } = VM.require(
    `${props.ownerId}/widget/includes.Utils.libs`,
  );

  const Loading = (props: { className: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 rounded shadow-sm animate-pulse ${props.className}`}
      ></div>
    );
  };
  const nfts = props.data?.nfts || [];
  if (props.loading || props.inventoryLoading) {
    return <Loading className="flex w-full h-8" />;
  }

  if (!props.ft?.tokens?.length && !nfts?.length) {
    return (
      <select className="appearance-none w-full h-8 text-xs px-2 outline-none rounded bg-white dark:bg-black-600 border dark:border-black-200">
        <option>N/A</option>
      </select>
    );
  }

  const ftAmount = props.ft?.amount ?? 0;

  return (
    <Select.Root>
      <Select.Trigger className="w-full h-8 text-sm px-2 rounded border dark:border-black-200 outline-none flex items-center justify-between cursor-pointer">
        <span>
          {ftAmount ? '$' + dollarFormat(ftAmount) : ''}
          <span className="bg-green-500 text-xs text-white rounded ml-2 px-1 p-0.5">
            {(props.ft?.tokens?.length || 0) + (nfts?.length || 0)}
          </span>
        </span>
        <ArrowDown className="w-4 h-4 fill-current text-gray-500 pointer-events-none" />
      </Select.Trigger>
      <Select.Content
        position="popper"
        sideOffset={5}
        className="SelectContent"
      >
        <ScrollArea.Root className="overflow-hidden rounded-b-xl soft-shadow bg-white dark:bg-black-600">
          <ScrollArea.Viewport className="border dark:border-black-200 z-50 pb-2">
            <div className="max-h-60">
              {props.ft?.tokens?.length > 0 && (
                <>
                  <div className="bg-gray-50 dark:bg-black-200 font-semibold px-3 py-2">
                    Tokens{' '}
                    <span className="font-normal">
                      ({props.ft?.tokens?.length})
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-neargray-10 text-xs divide-y dark:divide-black-200 outline-none">
                    {props.ft?.tokens?.map((token, index) => (
                      <div key={token?.contract}>
                        <Link
                          href={`/token/${token?.contract}?a=${props.id}`}
                          className="hover:no-underline"
                        >
                          <a className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-black-200 truncate hover:no-underline">
                            <div key={index}>
                              <div className="flex items-center">
                                <div className="flex mr-1">
                                  <img
                                    src={
                                      token?.ft_meta?.icon ??
                                      '/images/tokenplaceholder.svg'
                                    }
                                    alt={token.ft_meta?.name}
                                    className="w-4 h-4"
                                  />
                                </div>
                                <span>
                                  {token?.ft_meta?.name
                                    ? truncateString(
                                        token?.ft_meta?.name,
                                        15,
                                        '...',
                                      )
                                    : ''}
                                  ({token?.ft_meta?.symbol})
                                </span>
                              </div>
                              <div className="text-gray-400 flex items-center mt-1">
                                {token?.rpcAmount
                                  ? localFormat(token?.rpcAmount)
                                  : token?.rpcAmount ?? ''}
                              </div>
                            </div>
                            {token?.ft_meta?.price && (
                              <div className="text-right">
                                <div>
                                  {token?.amountUsd
                                    ? '$' + dollarFormat(token?.amountUsd)
                                    : '$' + (token.amountUsd ?? '')}
                                </div>
                                <div className="text-gray-400">
                                  {token?.ft_meta?.price
                                    ? '@' +
                                      Big(token?.ft_meta?.price).toString()
                                    : '@' + (token?.ft_meta?.price ?? '')}
                                </div>
                              </div>
                            )}
                          </a>
                        </Link>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {nfts?.length > 0 && (
                <>
                  <div className="bg-gray-50 dark:bg-black-200 font-semibold px-3 py-2">
                    NFT Tokens{' '}
                    <span className="font-normal">({nfts?.length})</span>
                  </div>
                  <div className="text-gray-600 dark:text-neargray-10 text-xs divide-y dark:divide-black-200 outline-none">
                    {nfts.map((nft) => (
                      <div key={nft?.contract}>
                        <Link
                          href={`/nft-token/${nft?.contract}?a=${props.id}`}
                          className="hover:no-underline"
                        >
                          <a className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-black-200 truncate hover:no-underline">
                            <div>
                              <div className="flex items-center">
                                <div className="flex mr-1">
                                  <img
                                    src={
                                      nft?.nft_meta?.icon ??
                                      `/images/tokenplaceholder.svg`
                                    }
                                    alt={nft?.nft_meta?.name}
                                    className="w-4 h-4"
                                  />
                                </div>
                                <span>
                                  {nft?.nft_meta?.name
                                    ? truncateString(
                                        nft?.nft_meta?.name,
                                        15,
                                        '...',
                                      )
                                    : nft?.nft_meta?.name ?? ''}
                                  ({nft?.nft_meta?.symbol})
                                </span>
                              </div>
                              <div className="text-gray-400 flex items-center mt-1">
                                {nft?.quantity
                                  ? localFormat(nft?.quantity)
                                  : nft?.quantity ?? ''}
                              </div>
                            </div>
                          </a>
                        </Link>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-neargray-25 dark:bg-black-600 transition-colors duration-[160ms] ease-out hover:bg-neargray-25 dark:hover:bg-black-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="flex-1 bg-neargray-50 dark:bg-black-200 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-neargray-25 dark:bg-black-600 transition-colors duration-[160ms] ease-out hover:bg-neargray-25 dark:hover:bg-black-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
            orientation="horizontal"
          >
            <ScrollArea.Thumb className="flex-1 bg-neargray-50 dark:bg-black-200 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner className="bg-neargray-50" />
        </ScrollArea.Root>
      </Select.Content>
    </Select.Root>
  );
};

export default TokenHoldings;
