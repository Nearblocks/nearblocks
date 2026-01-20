/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

import { numberFormat, toTokenAmount } from '@/lib/format';

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
};
type AmountProps = {
  amount: string;
  decimals: number;
};

const placeholder = '/images/placeholder.svg';

export const TokenImage = ({ alt, src, ...rest }: ImageProps) => {
  const [url, setUrl] = useState<string>(() => {
    if (src.startsWith('https') || src.startsWith('data:image/')) {
      return src;
    }

    return placeholder;
  });

  const onError = () => {
    setUrl(placeholder);
  };

  return (
    <img alt={alt} className="h-4 w-4" onError={onError} src={url} {...rest} />
  );
};

export const TokenAmount = ({ amount, decimals }: AmountProps) => {
  return +amount > 0 ? (
    <span className="text-lime-foreground">
      +
      {numberFormat(toTokenAmount(amount, decimals), {
        maximumFractionDigits: 6,
      })}
    </span>
  ) : (
    <span className="text-red-foreground">
      {numberFormat(toTokenAmount(amount, decimals), {
        maximumFractionDigits: 6,
      })}
    </span>
  );
};
