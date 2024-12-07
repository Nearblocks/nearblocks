import { useEffect, useState } from 'react';

import { useFetch } from '@/hooks/app/useFetch';
import { priceFormat } from '@/utils/app/libs';

interface Props {
  token: string;
  tokenPrice: null | string;
}

interface TokenPriceData {
  decimal: string;
  price: string;
  symbol: string;
}

const TokenPrice = ({ token, tokenPrice }: Props) => {
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
    <span>
      {finalPrice ? (
        `$${priceFormat(finalPrice)}`
      ) : (
        <span className="text-xs">N/A</span>
      )}
    </span>
  );
};

export default TokenPrice;
