import { ImageResponse } from 'next/og';

import { Title, Wrapper } from '@/components/thumbnail';
import { Background } from '@/icons/og';
import { getRuntimeConfig } from '@/lib/config';
import { hasLocale, translator } from '@/locales/dictionaries';

export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200,
};

type Props = PageProps<'/[lang]/apis'>;

const Image = async ({ params }: Props) => {
  const [{ lang }, config] = await Promise.all([params, getRuntimeConfig()]);
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'apis');
  const title =
    config.network === 'mainnet'
      ? t('meta.title')
      : `TESTNET | ${t('meta.title')}`;

  return new ImageResponse(
    (
      <Wrapper>
        <Title>{title}</Title>
        <Background
          style={{
            height: 540,
            opacity: 0.05,
            position: 'absolute',
            width: 540,
          }}
        />
      </Wrapper>
    ),
    { ...size },
  );
};

export default Image;
