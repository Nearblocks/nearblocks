import { Tooltip } from '@reach/tooltip';
import React, { useEffect, useState } from 'react';

import Skeleton from '../../skeleton/common/Skeleton';
import { useFetch } from '@/hooks/useFetch';
import { dollarNonCentFormat } from '@/utils/libs';

interface MarketCapProps {
  onToggle: () => void;
  showMarketCap: boolean;
  token: {
    contract: string;
    fully_diluted_market_cap: string;
    market_cap: string;
    onchain_market_cap: string;
    price: string;
    total_supply: string;
  } | null;
}

const MarketCap = ({ onToggle, showMarketCap, token }: MarketCapProps) => {
  const modifiedToken =
    token?.contract === 'eth.bridge.near' ? 'aurora' : token;

  const { data } = useFetch('https://indexer.ref.finance/list-token-price');
  const [price, setPrice] = useState<null | string>(null);

  useEffect(() => {
    if (token && modifiedToken && !token.price && data) {
      setPrice(data[`${modifiedToken}`]?.price || null);
    } else {
      setPrice(token?.price || null);
    }
  }, [data, token, modifiedToken]);

  if (!token) {
    return (
      <div className="w-20">
        <Skeleton className="h-4" />
      </div>
    );
  }

  const isPriceAvailable = token?.price !== null && token?.price !== undefined;

  if (isPriceAvailable) {
    const fullyDilutedMarketCap = Number(token.fully_diluted_market_cap);
    const marketCap = Number(token.market_cap);

    if (fullyDilutedMarketCap > 0 || marketCap > 0) {
      return (
        <div className="w-full break-words flex flex-wrap text-sm">
          {fullyDilutedMarketCap > 0 && marketCap > 0 ? (
            <Tooltip
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
              label={showMarketCap ? 'Click to switch back' : 'Click to switch'}
            >
              <p
                className="px-1 py-1 text-xs cursor-pointer rounded bg-gray-100 dark:bg-black-200"
                onClick={onToggle}
              >
                {showMarketCap
                  ? `$${dollarNonCentFormat(token.market_cap)}`
                  : `$${dollarNonCentFormat(token.fully_diluted_market_cap)}`}
              </p>
            </Tooltip>
          ) : (
            <p className="px-1 py-1 text-xs cursor-pointer rounded bg-gray-100 dark:bg-black-200">
              {`$${dollarNonCentFormat(
                marketCap ? token.market_cap : token.fully_diluted_market_cap,
              )}`}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="w-full break-words flex flex-wrap text-sm">
        {token.onchain_market_cap ? (
          <p className="px-1 py-1 text-xs cursor-pointer rounded bg-gray-100 dark:bg-black-200">
            ${dollarNonCentFormat(token.onchain_market_cap)}
          </p>
        ) : (
          'N/A'
        )}
      </div>
    );
  }

  return (
    <div className="w-full break-words flex flex-wrap text-sm">
      {price && token?.total_supply ? (
        <p className="px-1 py-1 text-xs rounded bg-gray-100 dark:bg-black-200">
          $
          {dollarNonCentFormat(
            (Number(price) * Number(token.total_supply)).toString(),
          )}
        </p>
      ) : (
        'N/A'
      )}
    </div>
  );
};

export default MarketCap;
