'use client';

import Big from 'big.js';
import { useEffect, useState } from 'react';

import { useFetch } from '@/hooks/app/useFetch';
import { priceFormat } from '@/utils/app/libs';
import { localFormat } from '@/utils/app/near';

interface Props {
  isShowMargin?: boolean;
  nearPrice?: string;
  token: string;
  tokenPrice: string;
}

interface TokenPriceData {
  decimal: string;
  price: string;
  symbol: string;
}

const TokenPrice = ({ isShowMargin, nearPrice, token, tokenPrice }: Props) => {
  const modifiedToken = token === 'eth.bridge.near' ? 'aurora' : token;
  const { data, error } = useFetch(
    'https://indexer.ref.finance/list-token-price',
  );
  const [price, setPrice] = useState<null | TokenPriceData>(null);

  useEffect(() => {
    if (data && modifiedToken in data) {
      setPrice(data[modifiedToken]);
    } else {
      setPrice(null);
    }
  }, [data, modifiedToken]);

  if (error) return null;

  const finalPrice = tokenPrice || price?.price;

  return (
    <>
      <span>
        {finalPrice ? (
          `$${priceFormat(finalPrice)}`
        ) : (
          <span className="text-xs">N/A</span>
        )}
      </span>
      {finalPrice !== null && finalPrice !== undefined && nearPrice && (
        <div
          className={`text-nearblue-700 ${
            isShowMargin ? 'mx-1' : ''
          } text-sm flex flex-row items-center`}
        >
          @{' '}
          {localFormat(
            Big(finalPrice).div(Big(nearPrice)).toNumber().toString(),
          )}{' '}
          Ⓝ
        </div>
      )}
    </>
  );
};

export default TokenPrice;
