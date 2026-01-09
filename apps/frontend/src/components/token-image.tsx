/* eslint-disable @next/next/no-img-element */
import { useState } from 'react';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
};

const placeholder = '/images/placeholder.svg';

export const TokenImage = ({ alt, src, ...rest }: Props) => {
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
