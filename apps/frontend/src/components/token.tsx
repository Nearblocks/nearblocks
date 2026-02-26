/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';

import { numberFormat, toTokenAmount } from '@/lib/format';
import { cn } from '@/lib/utils';

import { Link } from './link';
import { Truncate, TruncateText } from './truncate';

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
};
type NFTMediaProps = {
  alt?: string;
  base?: null | string;
  media?: null | string;
  reference?: null | string;
  referenceHash?: null | string;
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'>;
type AmountProps = {
  amount: string;
  className?: string;
  decimals: number;
  hideSign?: boolean;
};
type LinkProps = {
  contract: string;
  name?: null | string;
  symbol?: null | string;
  type?: 'mt-tokens' | 'nft-tokens' | 'tokens';
};

const placeholder = '/images/placeholder.svg';

const resolveUrl = (path: string, base: null | string): string => {
  if (
    path.startsWith('https://') ||
    path.startsWith('http://') ||
    path.startsWith('data:image')
  ) {
    return path;
  }
  if (base) return `${base.replace(/\/+$/, '')}/${path}`;
  return `https://ipfs.io/ipfs/${path}`;
};

const verifyReferenceHash = async (
  content: string,
  hash: string,
): Promise<boolean> => {
  const buffer = await window.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(content),
  );
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64 === hash;
};

const fetchReferenceMedia = async (
  referenceUrl: string,
  referenceHash: null | string | undefined,
  base: null | string,
): Promise<null | string> => {
  const res = await fetch(referenceUrl);
  const text = await res.text();

  if (referenceHash) {
    const valid = await verifyReferenceHash(text, referenceHash);
    if (!valid) return null;
  }

  const data = JSON.parse(text) as { media?: null | string };
  const media = data?.media ?? null;
  if (!media) return null;
  return resolveUrl(media, base);
};

export const NFTMedia = ({
  alt,
  base,
  media,
  reference,
  referenceHash,
  ...rest
}: NFTMediaProps) => {
  const [src, setSrc] = useState<string>(placeholder);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (
      media &&
      (media.startsWith('https://') ||
        media.startsWith('http://') ||
        media.startsWith('data:image'))
    ) {
      setSrc(media);
      setLoading(false);
      return;
    }

    const resolve = async () => {
      try {
        if (media) {
          setSrc(resolveUrl(media, base ?? null));
          return;
        }

        if (reference) {
          const referenceUrl = resolveUrl(reference, base ?? null);
          const resolved = await fetchReferenceMedia(
            referenceUrl,
            referenceHash,
            base ?? null,
          );
          if (resolved) {
            setSrc(resolved);
            return;
          }
        }
      } catch {
        // fall through to placeholder
      } finally {
        setLoading(false);
      }
    };

    resolve();
  }, [base, media, reference, referenceHash]);

  return (
    <span className="relative flex h-full w-full items-center justify-center">
      {loading && (
        <span className="absolute inset-0 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      )}
      <TokenImage
        alt={alt}
        src={src}
        {...rest}
        onLoad={() => setLoading(false)}
      />
    </span>
  );
};

const toUrl = (src: string) =>
  src.startsWith('https') || src.startsWith('data:image/') ? src : placeholder;

export const TokenImage = ({ alt, src, ...rest }: ImageProps) => {
  const [url, setUrl] = useState(() => toUrl(src));

  useEffect(() => {
    setUrl(toUrl(src));
  }, [src]);

  const onError = () => {
    setUrl(placeholder);
  };

  return (
    <img alt={alt} className="h-4 w-4" onError={onError} src={url} {...rest} />
  );
};

export const TokenAmount = ({
  amount,
  className,
  decimals,
  hideSign,
}: AmountProps) => {
  const formatted = numberFormat(toTokenAmount(amount, decimals), {
    maximumFractionDigits: 6,
  });
  const display = hideSign ? formatted.replace(/^-/, '') : formatted;

  return +amount > 0 ? (
    <span className={cn('text-lime-foreground', className)}>
      {!hideSign && '+'}
      {display}
    </span>
  ) : (
    <span className={cn('text-red-foreground', className)}>{display}</span>
  );
};

export const TokenLink = ({
  contract,
  name,
  symbol,
  type = 'tokens',
}: LinkProps) => {
  return (
    <Link
      className="text-link flex items-center gap-1"
      href={`/${type}/${contract}`}
    >
      <Truncate>
        <TruncateText className="max-w-20" text={name ?? contract} />
      </Truncate>
      {symbol && (
        <Truncate className="text-muted-foreground">
          (<TruncateText className="max-w-15" text={symbol} />)
        </Truncate>
      )}
    </Link>
  );
};
