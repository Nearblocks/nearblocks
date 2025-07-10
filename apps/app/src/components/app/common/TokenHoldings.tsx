import 'react-perfect-scrollbar/dist/css/styles.css';

import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Link } from '@/i18n/routing';
import { dollarFormat, localFormat, truncateString } from '@/utils/libs';
import { InventoryInfo, TokenListInfo } from '@/utils/types';

import ArrowDown from '@/components/app/Icons/ArrowDown';
import Skeleton from '@/components/app/skeleton/common/Skeleton';
import { priceFormat } from '@/utils/app/libs';

interface Props {
  appUrl?: string;
  data: InventoryInfo;
  ft: {
    amount: string;
    tokens: TokenListInfo[];
  };
  id?: string;
  inventoryLoading?: boolean;
  loading?: boolean;
  spamTokens?: string[];
}

const TokenHoldings = (props: Props) => {
  /* eslint-disable @next/next/no-img-element */
  const ft = props?.ft?.tokens;
  const nfts = props?.data?.nfts || [];

  if (ft?.length === 0 && nfts?.length === 0) {
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
    <PopoverRoot positioning={{ sameWidth: true }}>
      <PopoverTrigger
        asChild
        className="relative w-full h-8 text-sm px-2 rounded border dark:border-black-200 outline-none flex items-center justify-between cursor-pointer"
      >
        <button>
          <span>
            {ftAmount && (ft?.length || nfts?.length) ? (
              <>
                {'$' + dollarFormat(ftAmount)}
                <span className="bg-green-500 dark:bg-green-250 text-xs text-white rounded ml-2 px-1 p-0.5">
                  {(ft?.length || 0) + (nfts?.length || 0)}
                </span>
              </>
            ) : (
              <Skeleton className="h-4 w-20" />
            )}
          </span>
          <ArrowDown className="w-4 h-4 fill-current text-nearblue-600 pointer-events-none" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-white w-full -mt-2 shadow border z-10 pb-1 dark:border-black-200 dark:bg-black overflow-hidden focus:outline-none"
        roundedBottom={'lg'}
        roundedTop={'xs'}
        position="absolute"
        suppressHydrationWarning
      >
        <div className="dark:bg-black max-h-60 mostly-customized-scrollbar">
          <div className="dark:bg-black lg:overflow-visible">
            {ft?.length > 0 && (
              <>
                <div className="bg-neargray-700 !bg-opacity-60 dark:bg-black-200 text-nearblue-600 dark:text-neargray-10 font-semibold pr-2 pl-2.5 py-2">
                  Tokens <span className="font-normal">({ft?.length})</span>
                </div>
                <div className="text-nearblue-600 dark:text-neargray-10 text-xs divide-y dark:divide-black-200 outline-none">
                  {ft?.map((token, index) => (
                    <div
                      className="dark:bg-black px-1 py-1"
                      key={token?.contract}
                    >
                      <Link
                        className="flex justify-between items-start px-0.5 py-1 truncate hover:no-underline hover:bg-gray-100 dark:hover:bg-black-200 rounded-lg"
                        href={`/token/${token?.contract}?a=${props.id?.toLowerCase()}`}
                      >
                        <div key={index}>
                          <div className="flex items-center p-1">
                            <div className="flex mr-1">
                              <img
                                alt={token?.ft_meta?.name ?? 'Token Icon'}
                                className="w-4 h-4"
                                height={16}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    '/images/tokenplaceholder.svg';
                                }}
                                src={
                                  token?.ft_meta?.icon
                                    ? token?.ft_meta?.icon.startsWith('http') ||
                                      token?.ft_meta?.icon.startsWith(
                                        'data:image/',
                                      )
                                      ? token?.ft_meta?.icon
                                      : '/images/tokenplaceholder.svg'
                                    : '/images/tokenplaceholder.svg'
                                }
                                width={16}
                              />
                            </div>
                            <span>
                              {token?.ft_meta?.name
                                ? truncateString(
                                    token?.ft_meta?.name,
                                    13,
                                    '...',
                                  )
                                : ''}
                              (
                              {truncateString(
                                token?.ft_meta?.symbol,
                                15,
                                '...',
                              )}
                              )
                            </span>
                          </div>
                          <div className="text-nearblue-600 dark:text-neargray-10 flex items-center my-0.5 mr-2.5 ml-1">
                            {token?.rpcAmount
                              ? localFormat(token?.rpcAmount)
                              : token?.rpcAmount ?? ''}
                          </div>
                        </div>

                        {!isTokenSpam(token?.contract) ? (
                          token?.ft_meta?.price && (
                            <div className="text-right p-0.5 pt-1">
                              <div>
                                {token?.amountUsd
                                  ? '$' + dollarFormat(token?.amountUsd)
                                  : '$' + (token?.amountUsd ?? '')}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {token?.ft_meta?.price
                                  ? '@' + priceFormat(token?.ft_meta?.price)
                                  : '@' + (token?.ft_meta?.price ?? '')}
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="text-gray-500 p-0.5">[Spam]</div>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
            {nfts?.length > 0 && (
              <>
                <div className="bg-neargray-700 !bg-opacity-70 dark:bg-black-200 text-nearblue-600 dark:text-neargray-10 font-semibold pr-2 pl-2.5 py-2">
                  NFT Tokens
                  <span className="font-normal">({nfts?.length})</span>
                </div>
                <div className="text-nearblue-600 dark:text-neargray-10 text-xs divide-y dark:divide-black-200 outline-none dark:bg-black">
                  {nfts.map((nft) => (
                    <div
                      className="dark:bg-black px-1 py-1"
                      key={nft?.contract}
                    >
                      <Link
                        className="flex justify-between items-start px-0.5 py-1 truncate hover:no-underline hover:bg-gray-100 dark:hover:bg-black-200 rounded-lg"
                        href={`/nft-token/${nft?.contract}`}
                      >
                        <div>
                          <div className="flex items-center p-1">
                            <div className="flex mr-1">
                              <img
                                alt={nft?.nft_meta?.name}
                                className="w-4 h-4"
                                height={16}
                                onError={(e) => {
                                  e.currentTarget.src =
                                    '/images/tokenplaceholder.svg';
                                  /* eslint-disable @next/next/no-img-element */
                                }}
                                src={
                                  nft?.nft_meta?.icon ??
                                  '/images/tokenplaceholder.svg'
                                }
                                width={16}
                              />
                            </div>
                            <span>
                              {nft?.nft_meta?.name
                                ? truncateString(nft?.nft_meta?.name, 15, '...')
                                : nft?.nft_meta?.name ?? ''}
                              ({nft?.nft_meta?.symbol})
                            </span>
                          </div>
                          <div className="text-nearblue-600 dark:text-neargray-10 flex items-center my-0.5 mr-2.5 ml-1.5">
                            {nft?.quantity
                              ? localFormat(nft?.quantity)
                              : nft?.quantity ?? ''}
                          </div>
                        </div>
                        {isTokenSpam(nft?.contract) && (
                          <div className="text-nearblue-600 p-0.5">[Spam]</div>
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default TokenHoldings;
