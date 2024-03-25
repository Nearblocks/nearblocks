import TokenImage from '@/includes/icons/TokenImage';
import { NFTImageProps } from '@/includes/types';

const getMediaUrl = async (base: string, media: string, reference: string) => {
  if (
    media.startsWith('https://') ||
    media.startsWith('http://') ||
    media.startsWith('data:image')
  )
    return Promise.resolve(media);

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
          return resp.body.media;
        })
        .catch(() => {});
    } catch (error) {
      //
    }
  }

  if (base) return Promise.resolve(`${base}/${media}`);

  return Promise.resolve(`https://cloudflare-ipfs.com/ipfs/${media}`);
};

export default function ({
  base,
  media,
  alt,
  reference,
  className,
  network,
}: NFTImageProps) {
  const networkAccountId =
    context.networkId === 'mainnet' ? 'nearblocks.near' : 'nearblocks.testnet';

  const { getConfig } = VM.require(
    `${networkAccountId}/widget/includes.Utils.libs`,
  );

  const [src, setSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const config = getConfig && getConfig(network);

  useEffect(() => {
    if (media || base || reference) {
      setLoading(true);
      getMediaUrl(base || '', media || '', reference)
        .then(setSrc)
        .catch((error: Error) => {
          console.error(error);
        })
        .finally(() => setLoading(false));
    }
  }, [base, media, reference]);

  const onLoad = () => setLoading(false);

  const onSetSrc = (newSrc: string) => {
    if (newSrc !== src) {
      setSrc(newSrc);
    }
  };

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
