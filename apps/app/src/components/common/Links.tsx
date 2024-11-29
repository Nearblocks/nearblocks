import { Tooltip } from '@reach/tooltip';
import { useTheme } from 'next-themes';
import Image from 'next/legacy/image';

import { urlHostName } from '@/utils/libs';

const Links = (props: any) => {
  const { meta } = props;
  const twitter = urlHostName && urlHostName(meta?.twitter);
  const facebook = urlHostName && urlHostName(meta?.facebook);
  const telegram = urlHostName && urlHostName(meta?.telegram);
  const { theme } = useTheme();

  return (
    <div className="flex space-x-4">
      {meta?.twitter && (
        <Tooltip
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          label={'Twitter'}
        >
          <a
            className="flex"
            href={
              !twitter ? `https://twitter.com/${meta?.twitter}` : meta?.twitter
            }
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            <Image
              alt="Twitter"
              height={16}
              src={
                theme === 'dark'
                  ? '/images/twitter_icon_black.svg'
                  : '/images/twitter_icon.svg'
              }
              width={16}
            />
          </a>
        </Tooltip>
      )}
      {meta?.facebook && (
        <Tooltip
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          label={'Facebook'}
        >
          <a
            className="flex"
            href={
              !facebook
                ? `https://facebook.com/${meta?.facebook}`
                : meta.facebook
            }
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            <Image
              alt="Facebook"
              className="w-4 h-4"
              height={16}
              src={
                theme === 'dark'
                  ? '/images/facebook_icon_black.svg'
                  : '/images/facebook_icon.svg'
              }
              width={16}
            />
          </a>
        </Tooltip>
      )}
      {meta?.telegram && (
        <Tooltip
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          label={'Telegram'}
        >
          <a
            className="flex"
            href={!telegram ? `https://t.me/${meta?.telegram}` : meta?.telegram}
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            <Image
              alt="Telegram"
              className="w-4 h-4"
              height={16}
              src={
                theme === 'dark'
                  ? '/images/telegram_black.svg'
                  : '/images/telegram.svg'
              }
              width={16}
            />
          </a>
        </Tooltip>
      )}
      {meta?.coingecko_id && (
        <Tooltip
          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white p-2 break-words"
          label={'CoinGecko'}
        >
          <a
            className="flex"
            href={`https://www.coingecko.com/en/coins/${meta?.coingecko_id}?utm_campaign=partnership&utm_source=nearblocks&utm_medium=referral`}
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            <Image
              alt="coingecko"
              className="w-4 h-4"
              height={16}
              src="/images/coingecko_icon.svg"
              width={16}
            />
          </a>
        </Tooltip>
      )}
    </div>
  );
};

export default Links;
