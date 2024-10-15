import { dollarFormat, localFormat, truncateString } from '@/utils/libs';
import { InventoryInfo, TokenListInfo } from '@/utils/types';
import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Menu, MenuItems, MenuButton, MenuPopover } from '@reach/menu-button';
import ArrowDown from '../Icons/ArrowDown';
import Big from 'big.js';
import { Link } from '@/i18n/routing';

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
  spamTokens?: string[];
}

const TokenHoldings = (props: Props) => {
  /* eslint-disable @next/next/no-img-element */
  const Loading = (props: { className: string }) => {
    return (
      <div
        className={`bg-gray-200 dark:bg-black-200 rounded shadow-sm animate-pulse ${props.className}`}
      ></div>
    );
  };

  const nfts = props?.data?.nfts || [];

  if (props?.loading || props?.inventoryLoading) {
    return <Loading className="flex w-full h-8" />;
  }

  if (!props?.ft?.tokens?.length && !nfts?.length) {
    return (
      <select className="appearance-none w-full h-8 text-xs px-2 outline-none rounded bg-white dark:bg-black-600 border dark:border-black-200">
        <option>N/A</option>
      </select>
    );
  }
  const ftAmount = props?.ft?.amount ?? 0;

  function isTokenSpam(tokenName: string) {
    if (props?.spamTokens) {
      for (const spamToken of props?.spamTokens) {
        const cleanedToken = spamToken.replace(/^\*/, '');
        if (tokenName.endsWith(cleanedToken)) {
          return true;
        }
      }
    }
    return false;
  }
  return (
    <Menu>
      <MenuButton className="w-full h-8 text-sm px-2 rounded border dark:border-black-200 outline-none flex items-center justify-between cursor-pointer">
        <span>
          {ftAmount !== null && ftAmount !== undefined
            ? '$' + dollarFormat(ftAmount)
            : ''}
          <span className="bg-green-500 dark:bg-green-250 text-xs text-white rounded ml-2 px-1 p-0.5">
            {(props?.ft?.tokens?.length || 0) + (nfts?.length || 0)}
          </span>
        </span>
        <ArrowDown className="w-4 h-4 fill-current text-gray-500 pointer-events-none" />
      </MenuButton>
      <MenuPopover portal={false} className="relative">
        <MenuItems className="absolute bg-white w-full rounded-b-lg shadow border z-50 pb-2 dark:border-black-200 dark:bg-black">
          <div className="dark:bg-black">
            <PerfectScrollbar>
              <div className="max-h-60 dark:bg-black">
                {props?.ft?.tokens?.length > 0 && (
                  <>
                    <div className="bg-gray-50 dark:bg-black-200 font-semibold px-3 py-2">
                      Tokens{' '}
                      <span className="font-normal">
                        ({props?.ft?.tokens?.length})
                      </span>
                    </div>
                    <div className="text-gray-600 dark:text-neargray-10 text-xs divide-y dark:divide-black-200 outline-none">
                      {props?.ft?.tokens?.map((token, index) => (
                        <div key={token?.contract} className="dark:bg-black">
                          <Link
                            href={`/token/${token?.contract}?a=${props.id}`}
                            className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-black-200 truncate hover:no-underline"
                          >
                            <div key={index}>
                              <div className="flex items-center">
                                <div className="flex mr-1">
                                  <img
                                    src={
                                      token?.ft_meta?.icon ??
                                      '/images/tokenplaceholder.svg'
                                    }
                                    alt={token?.ft_meta?.name}
                                    width={16}
                                    height={16}
                                    className="w-4 h-4"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        '/images/tokenplaceholder.svg';
                                    }}
                                    /* eslint-disable-next-line @next/next/no-img-element */
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

                            {!isTokenSpam(token?.contract) ? (
                              token?.ft_meta?.price && (
                                <div className="text-right">
                                  <div>
                                    {token?.amountUsd
                                      ? '$' + dollarFormat(token?.amountUsd)
                                      : '$' + (token?.amountUsd ?? '')}
                                  </div>
                                  <div className="text-gray-400">
                                    {token?.ft_meta?.price
                                      ? '@' +
                                        Big(token?.ft_meta?.price)?.toString()
                                      : '@' + (token?.ft_meta?.price ?? '')}
                                  </div>
                                </div>
                              )
                            ) : (
                              <div className="text-gray-400">[Spam]</div>
                            )}
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
                    <div className="text-gray-600 dark:text-neargray-10 text-xs divide-y dark:divide-black-200 outline-none dark:bg-black">
                      {nfts?.map((nft) => (
                        <div key={nft?.contract} className="dark:bg-black">
                          <Link
                            href={`/nft-token/${nft?.contract}`}
                            className="flex justify-between items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-black-200 truncate hover:no-underline"
                          >
                            <div>
                              <div className="flex items-center">
                                <div className="flex mr-1">
                                  <img
                                    src={
                                      nft?.nft_meta?.icon ??
                                      '/images/tokenplaceholder.svg'
                                    }
                                    alt={nft?.nft_meta?.name}
                                    width={16}
                                    height={16}
                                    className="w-4 h-4"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        '/images/tokenplaceholder.svg';
                                    }}
                                    /* eslint-disable-next-line @next/next/no-img-element */
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
                            {isTokenSpam(nft?.contract) && (
                              <div className="text-gray-400">[Spam]</div>
                            )}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </PerfectScrollbar>
          </div>
        </MenuItems>
      </MenuPopover>
    </Menu>
  );
};

export default TokenHoldings;
