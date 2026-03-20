import { ImageResponse } from 'next/og';

import { Title, Wrapper } from '@/components/thumbnail';
import { TokenBG } from '@/icons/og';
import { getRuntimeConfig } from '@/lib/config';
import { hasLocale, translator } from '@/locales/dictionaries';

export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200,
};

type Props = PageProps<'/[lang]/tokens/transfers'>;

const Image = async ({ params }: Props) => {
  const [{ lang }, config] = await Promise.all([params, getRuntimeConfig()]);
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'fts');
  const title =
    config.networkId === 'mainnet'
      ? t('transfersMeta.title')
      : `TESTNET ${t('transfersMeta.title')}`;

  return new ImageResponse(
    (
      <Wrapper>
        <Title>{title}</Title>
        <TokenBG
          style={{
            height: 540,
            opacity: 0.05,
            position: 'absolute',
            width: 960,
          }}
        />
      </Wrapper>
    ),
    { ...size },
  );
};

export default Image;
