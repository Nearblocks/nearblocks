import { useTheme } from 'next-themes';
import Image from 'next/image';

import { urlHostName } from '@/utils/libs';

import Tooltip from './Tooltip';

const Links = (props: any) => {
  const { meta, theme: cookieTheme } = props;
  const twitter = urlHostName && urlHostName(meta?.twitter);
  const facebook = urlHostName && urlHostName(meta?.facebook);
  const telegram = urlHostName && urlHostName(meta?.telegram);
  let { theme } = useTheme();
  if (theme == undefined) {
    theme = cookieTheme;
  }
  return (
    <div className="flex space-x-4">
      {meta?.twitter && (
        <Tooltip
          className={'left-1/2 max-w-[200px]'}
          position="top"
          tooltip={'Twitter'}
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
              loading="eager"
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
          className={'left-1/2 max-w-[200px]'}
          position="top"
          tooltip={'Facebook'}
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
              loading="eager"
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
          className={'left-1/2 max-w-[200px]'}
          position="top"
          tooltip={'Telegram'}
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
              loading="eager"
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
          className={'left-1/2 max-w-[200px]'}
          position="top"
          tooltip={'CoinGecko'}
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
              loading="eager"
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
