import Big from 'big.js';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Link } from '@/i18n/routing';
import { dollarFormat, localFormat, truncateString } from '@/utils/libs';
import { InventoryInfo, TokenListInfo } from '@/utils/types';

import ArrowDown from '../Icons/ArrowDown';
import Skeleton from '../skeleton/common/Skeleton';

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

  const nfts = props?.data?.nfts || [];

  if (!props?.ft?.tokens?.length && !nfts?.length) {
    return (
      <select className="appearance-none w-full h-8 text-xs px-2 outline-none rounded bg-white dark:bg-black-600 border dark:border-black-200">
        <option>N/A</option>
      </select>
    );
  }
  const ftAmount = props.ft?.amount ?? 0;

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
            {ftAmount && (props.ft?.tokens?.length || nfts?.length) ? (
              <>
                {'$' + dollarFormat(ftAmount)}
                <span className="bg-green-500 dark:bg-green-250 text-xs text-white rounded ml-2 px-1 p-0.5">
                  {(props.ft?.tokens?.length || 0) + (nfts?.length || 0)}
                </span>
              </>
            ) : (
              <Skeleton className="h-4 w-20" />
            )}
          </span>
          <ArrowDown className="w-4 h-4 fill-current text-gray-500 pointer-events-none" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-white w-full -mt-2 rounded-b-lg shadow border z-10 pb-2 dark:border-black-200 dark:bg-black overflow-hidden focus:outline-none"
        roundedBottom={'lg'}
        roundedTop={'none'}
      >
        <div className="dark:bg-black">
          <PerfectScrollbar>
            <div className="max-h-60 dark:bg-black">
              {props.ft?.tokens?.length > 0 && (
                <>
                  <div className="bg-gray-50 dark:bg-black-200 text-gray-600 dark:text-neargray-10  font-semibold px-3 py-2">
                    Tokens{' '}
                    <span className="font-normal">
                      ({props.ft?.tokens?.length})
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-neargray-10 text-xs divide-y dark:divide-black-200 outline-none">
                    {props.ft?.tokens?.map((token, index) => (
                      <div className="dark:bg-black p-2" key={token?.contract}>
                        <Link
                          className="flex justify-between items-center px-2 py-1 truncate hover:no-underline hover:bg-gray-100 dark:hover:bg-black-200 rounded-lg"
                          href={`/token/${token?.contract}?a=${props.id}`}
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
                                      ? token.ft_meta.icon.startsWith('http') ||
                                        token.ft_meta.icon.startsWith(
                                          'data:image/',
                                        )
                                        ? token.ft_meta.icon
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
                                      15,
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
                            <div className="text-gray-400 flex items-center my-0.5 mx-2.5">
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
                                    : '$' + (token.amountUsd ?? '')}
                                </div>
                                <div className="text-gray-400">
                                  {token?.ft_meta?.price
                                    ? '@' +
                                      Big(token?.ft_meta?.price).toString()
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
                  <div className="bg-gray-50 dark:bg-black-200 text-gray-600 dark:text-neargray-10 font-semibold px-3 py-2">
                    NFT Tokens{' '}
                    <span className="font-normal">({nfts?.length})</span>
                  </div>
                  <div className="text-gray-600 dark:text-neargray-10 text-xs divide-y dark:divide-black-200 outline-none dark:bg-black">
                    {nfts.map((nft) => (
                      <div className="dark:bg-black p-2" key={nft?.contract}>
                        <Link
                          className="flex justify-between items-center px-2 py-1 truncate hover:no-underline hover:bg-gray-100 dark:hover:bg-black-200 rounded-lg"
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
                                  ? truncateString(
                                      nft?.nft_meta?.name,
                                      15,
                                      '...',
                                    )
                                  : nft?.nft_meta?.name ?? ''}
                                ({nft?.nft_meta?.symbol})
                              </span>
                            </div>
                            <div className="text-gray-400 flex items-center my-0.5 mx-2.5">
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
      </PopoverContent>
    </PopoverRoot>
  );
};

export default TokenHoldings;
