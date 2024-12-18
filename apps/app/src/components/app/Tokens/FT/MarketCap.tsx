'use client';

import React, { useEffect, useState } from 'react';

import { useFetch } from '@/hooks/app/useFetch';
import { dollarNonCentFormat } from '@/utils/app/libs';

import Tooltip from '../../common/Tooltip';
import Skeleton from '../../skeleton/common/Skeleton';

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
  const { data } = useFetch('https://indexer.ref.finance/list-token-price');
  const [price, setPrice] = useState<null | string>(null);

  useEffect(() => {
    if (token && token.contract && !token.price && data) {
      setPrice(data[token.contract]?.price || null);
    } else {
      setPrice(token?.price || null);
    }
  }, [data, token]);

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
              className={'left-1/2 max-w-[200px] whitespace-nowrap'}
              position="bottom"
              tooltip={
                showMarketCap ? 'Click to switch back' : 'Click to switch'
              }
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
