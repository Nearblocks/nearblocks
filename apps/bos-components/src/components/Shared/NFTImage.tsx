import TokenImage from '@/includes/icons/TokenImage';
import { getConfig } from '@/includes/libs';
import { NFTImageProps } from '@/includes/types';

export default function ({
  base,
  media,
  alt,
  reference,
  className,
  network,
}: NFTImageProps) {
  const [src, setSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const config = getConfig(network);

  useEffect(() => {
    function getMediaUrl(base: string, media: string, reference: string) {
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
          return asyncFetch(
            base ? `${base.replace(/\/+$/, '')}/${reference}` : `${reference}`,
          )
            .then((resp: any) => {
              return resp.data.media;
            })
            .catch(() => {});
        } catch (error) {
          //
        }
      }

      if (base) return `${base}/${media}`;

      return `https://cloudflare-ipfs.com/ipfs/${media}`;
    }

    if (media || base || reference) {
      setSrc(getMediaUrl(base || '', media || '', reference || ''));
    }
  }, [base, media, reference]);

  const onLoad = () => setLoading(false);

  const onSetSrc = (src: string) => setSrc(src);

  return (
    <span className="w-full h-full flex items-center justify-center relative">
      {loading && (
        <span className="absolute inset-0 bg-white">
          <span className="absolute inset-0 animate-pulse bg-gray-300 rounded" />
        </span>
      )}
      <TokenImage
        src={src}
        alt={alt}
        className={className}
        appUrl={config.appUrl}
        onLoad={onLoad}
        onSetSrc={onSetSrc}
      />
    </span>
  );
}
