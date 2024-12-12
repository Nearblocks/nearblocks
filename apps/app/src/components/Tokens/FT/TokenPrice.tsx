import { useFetch } from '@/hooks/useFetch';
import { priceFormat } from '@/utils/libs';
import { localFormat } from '@/utils/near';
import Big from 'big.js';
import { useEffect, useState } from 'react';

interface Props {
  token: string;
  tokenPrice: string;
  nearPrice?: string;
  isShowMargin?: boolean;
}

interface TokenPriceData {
  decimal: string;
  price: string;
  symbol: string;
}

const TokenPrice = ({ token, tokenPrice, nearPrice, isShowMargin }: Props) => {
  const { data, error } = useFetch(
    'https://indexer.ref.finance/list-token-price',
  );
  const [price, setPrice] = useState<null | TokenPriceData>(null);

  useEffect(() => {
    if (data && token in data) {
      setPrice(data[token]);
    } else {
      setPrice(null);
    }
  }, [data, token]);

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
