import { urlHostName } from '@/utils/libs';
import { Tooltip } from '@reach/tooltip';
import Image from 'next/image';

const Links = (props: any) => {
  const { meta } = props;
  const twitter = urlHostName && urlHostName(meta?.twitter);
  const facebook = urlHostName && urlHostName(meta?.facebook);
  const telegram = urlHostName && urlHostName(meta?.telegram);

  return (
    <div className="flex space-x-4">
      {meta?.twitter && (
        <Tooltip
          label={'Twitter'}
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
        >
          <a
            href={
              !twitter ? `https://twitter.com/${meta.twitter}` : meta.twitter
            }
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex"
          >
            <Image
              width={16}
              height={16}
              src="/images/twitter_icon.svg"
              alt="Twitter"
              priority
            />
          </a>
        </Tooltip>
      )}
      {meta?.facebook && (
        <Tooltip
          label={'Facebook'}
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
        >
          <a
            href={
              !facebook
                ? `https://facebook.com/${meta.facebook}`
                : meta.facebook
            }
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex"
          >
            <Image
              width={16}
              height={16}
              className="w-4 h-4"
              src="/images/facebook_icon.svg"
              alt="Facebook"
              priority
            />
          </a>
        </Tooltip>
      )}
      {meta?.telegram && (
        <Tooltip
          label={'Telegram'}
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
        >
          <a
            href={!telegram ? `https://t.me/${meta.telegram}` : meta.telegram}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex"
          >
            <Image
              width={16}
              height={16}
              className="w-4 h-4"
              src="/images/telegram_icon.svg"
              alt="Telegram"
            />
          </a>
        </Tooltip>
      )}
      {meta?.coingecko_id && (
        <Tooltip
          label={'CoinGecko'}
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
        >
          <a
            href={`https://www.coingecko.com/en/coins/${meta.coingecko_id}?utm_campaign=partnership&utm_source=nearblocks&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex"
          >
            <Image
              width={16}
              height={16}
              className="w-4 h-4"
              src="/images/coingecko_icon.svg"
              alt="coingecko"
            />
          </a>
        </Tooltip>
      )}
    </div>
  );
};

export default Links;
