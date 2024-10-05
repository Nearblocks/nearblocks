import { NFTImageProps } from '@/utils/types';
import axios from 'axios';
import { useEffect, useState } from 'react';

const placeholder = '/images/tokenplaceholder.svg';

const getMediaUrl = async (base: string, media: string, reference: string) => {
  if (
    media.startsWith('https://') ||
    media.startsWith('http://') ||
    media.startsWith('data:image')
  )
    return media;

  if (
    reference &&
    (base.startsWith('https://arweave.net') ||
      reference.startsWith('https://arweave.net'))
  ) {
    try {
      const resp = await axios.get(
        base ? `${base.replace(/\/+$/, '')}/${reference}` : `${reference}`,
      );

      return resp.data.media;
    } catch (error) {
      //
    }
  }

  if (base) return `${base}/${media}`;

  return `https://cloudflare-ipfs.com/ipfs/${media}`;
};

export const NFTImage = ({
  base,
  media,
  alt,
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
      <TokenImage src={src} alt={alt} {...rest} onLoad={onLoad} />
    </span>
  );
};

const TokenImage = ({ src, alt, ...rest }: any) => {
  const onError = (e: any) => {
    e.target.onError = null;
    e.target.src = placeholder;
  };
  /* eslint-disable @next/next/no-img-element */
  return <img src={src || placeholder} alt={alt} {...rest} onError={onError} />;
};

export default TokenImage;
