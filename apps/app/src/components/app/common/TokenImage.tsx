import axios from 'axios';
import { useEffect, useState } from 'react';

import { NFTImageProps } from '@/utils/types';

const placeholder = '/images/tokenplaceholder.svg';

const getMediaUrl = async (base: string, media: string, reference: string) => {
  if (
    media?.startsWith('https://') ||
    media?.startsWith('http://') ||
    media?.startsWith('data:image')
  )
    return media;

  if (
    reference &&
    (base?.startsWith('https://arweave.net') ||
      reference?.startsWith('https://arweave.net'))
  ) {
    try {
      const resp = await axios.get(
        base ? `${base.replace(/\/+$/, '')}/${reference}` : `${reference}`,
      );

      return resp?.data?.media;
    } catch (error) {
      //
    }
  }

  if (base) return `${base}/${media}`;

  return `https://cloudflare-ipfs.com/ipfs/${media}`;
};

export const NFTImage = ({
  alt,
  base,
  media,
  reference,
  ...rest
}: NFTImageProps) => {
  const [src, setSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (media || base || reference) {
      getMediaUrl(base || '', media || '', reference)
        .then(setSrc)
        .catch((error: Error) => {
          console.error(error);
        });
    }
  }, [base, media, reference]);

  const onLoad = () => setLoading(false);

  return (
    <span className="w-full h-full flex items-center justify-center relative">
      {loading && (
        <span className="absolute inset-0 bg-white">
          <span className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-black-200 rounded" />
        </span>
      )}
      <TokenImage alt={alt} src={src} {...rest} onLoad={onLoad} />
    </span>
  );
};

const TokenImage = ({ alt, src, ...rest }: any) => {
  const [imgUrl, setImgUrl] = useState<string>(src || placeholder);

  useEffect(() => {
    if (src && (src?.startsWith('https') || src?.startsWith('data:image/'))) {
      setImgUrl(src);
    } else {
      setImgUrl(placeholder);
    }
  }, [src]);

  const onError = () => {
    setImgUrl(placeholder);
  };

  /* eslint-disable @next/next/no-img-element */
  return <img alt={alt} src={imgUrl} {...rest} onError={onError} />;
};

export default TokenImage;
