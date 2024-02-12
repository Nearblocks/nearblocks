/**
 * @interface Props
 * @param {string} [id] - Optional identifier for the account, passed as a string.
 * @param {boolean} [loading] - Flag indicating whether data is currently loading.
 * @param {InventoryInfo} [data] - Information related to the inventory.
 * @param {Object} [ft] - Object containing details about the tokens.
 * @param {number} [ft.amount] -  amount in USD of tokens.
 * @param {Object[]} [ft.tokens] - Array containing 'TokenListInfo' objects, providing information about individual token details.
 * @param {string} [appUrl] - The URL of the application.
 */

import { truncateString } from '@/includes/libs';
import ArrowDown from '@/includes/icons/ArrowDown';
import { dollarFormat, localFormat } from '@/includes/formats';
import { InventoryInfo, TokenListInfo } from '@/includes/types';

interface Props {
  id?: string;
  loading?: boolean;
  data: InventoryInfo;
  ft: {
    amount: string;
    tokens: TokenListInfo[];
  };
  appUrl?: string;
}

const TokenHoldings = (props: Props) => {
  const Loading = (props: { className: string; wrapperClassName: string }) => {
    return (
      <div
        className={`bg-gray-200 h-5 rounded shadow-sm animate-pulse ${props.className}`}
      ></div>
    );
  };

  const nfts = props.data?.nfts || [];

  if (props.loading) {
    return <Loading className="h-full" wrapperClassName="flex w-full h-7" />;
  }

  if (!props.ft?.tokens?.length && !nfts?.length) {
    return (
      <select className="appearance-none w-full h-8 text-xs px-2 outline-none rounded bg-white border">
        <option>N/A</option>
      </select>
    );
  }
  return (
    <Select.Root>
      <Select.Trigger className="w-96 h-8 text-sm px-2 rounded border outline-none flex items-center justify-between cursor-pointer">
        <span>
          ${props.ft?.amount !== null ? dollarFormat(props.ft?.amount) : ''}
          <span className="bg-green-500 text-xs text-white rounded ml-2 px-1 p-1">
            {(props.ft?.tokens?.length || 0) + (nfts?.length || 0)}
          </span>
        </span>
        <ArrowDown className="w-4 h-4 fill-current text-gray-500 pointer-events-none" />
      </Select.Trigger>
      <Select.Content>
        <ScrollArea.Root className="w-96 h-72  overflow-hidden rounded-b-xl soft-shadow bg-white">
          <ScrollArea.Viewport className="w-full h-full border z-50 pb-2">
            <div className="max-h-60">
              {props.ft?.tokens?.length > 0 && (
                <>
                  <div className="bg-gray-50 font-semibold px-3 py-2">
                    Tokens{' '}
                    <span className="font-normal">
                      ({props.ft?.tokens?.length})
                    </span>
                  </div>
                  <div className="text-gray-600 text-xs divide-y outline-none">
                    {props.ft?.tokens?.map((token, index) => (
                      <div key={token.contract}>
                        <a
                          href={`/token/${token.contract}?a=${props.id}`}
                          className="hover:no-underline"
                        >
                          <a className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 truncate hover:no-underline">
                            <div key={index}>
                              <div className="flex items-center">
                                <div className="flex mr-1">
                                  <img
                                    src={
                                      token.ft_metas?.icon ||
                                      `${props.appUrl}images/tokenplaceholder.svg`
                                    }
                                    alt={token.ft_metas?.name}
                                    className="w-4 h-4"
                                  />
                                </div>
                                <span>
                                  {token.ft_metas.name
                                    ? truncateString(
                                        token.ft_metas?.name,
                                        15,
                                        '...',
                                      )
                                    : ''}
                                  ({token.ft_metas?.symbol})
                                </span>
                              </div>
                              <div className="text-gray-400 flex items-center mt-1">
                                {localFormat(token?.rpcAmount)}
                              </div>
                            </div>
                            {token.ft_metas?.price && (
                              <div className="text-right">
                                <div>${dollarFormat(token.amountUsd)}</div>
                                <div className="text-gray-400">
                                  @{Big(token.ft_metas?.price).toString()}
                                </div>
                              </div>
                            )}
                          </a>
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {nfts?.length > 0 && (
                <>
                  <div className="bg-gray-50 font-semibold px-3 py-2">
                    NFT Tokens{' '}
                    <span className="font-normal">({nfts?.length})</span>
                  </div>
                  <div className="text-gray-600 text-xs divide-y outline-none">
                    {nfts.map((nft) => (
                      <div key={nft.contract}>
                        <a
                          href={`/nft-token/${nft.contract}?a=${props.id}`}
                          className="hover:no-underline"
                        >
                          <a className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 truncate hover:no-underline">
                            <div>
                              <div className="flex items-center">
                                <div className="flex mr-1">
                                  <img
                                    src={
                                      nft.nft_meta?.icon ||
                                      `${props.appUrl}images/tokenplaceholder.svg`
                                    }
                                    alt={nft.nft_meta?.name}
                                    className="w-4 h-4"
                                  />
                                </div>
                                <span>
                                  {nft.nft_meta?.name
                                    ? truncateString(
                                        nft.nft_meta?.name,
                                        15,
                                        '...',
                                      )
                                    : ''}
                                  ({nft.nft_meta?.symbol})
                                </span>
                              </div>
                              <div className="text-gray-400 flex items-center mt-1">
                                {localFormat(nft.quantity)}
                              </div>
                            </div>
                          </a>
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
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
      </Select.Content>
    </Select.Root>
  );
};

export default TokenHoldings;
