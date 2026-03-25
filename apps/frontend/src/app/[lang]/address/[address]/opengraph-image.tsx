import { ImageResponse } from 'next/og';

import { SubTitle, Title, TitleWrapper, Wrapper } from '@/components/thumbnail';
import { AccountBG } from '@/icons/og';
import { getRuntimeConfig } from '@/lib/config';
import { hasLocale, translator } from '@/locales/dictionaries';

export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200,
};

type Props = PageProps<'/[lang]/address/[address]'>;

const Image = async ({ params }: Props) => {
  const [{ address, lang }, config] = await Promise.all([
    params,
    getRuntimeConfig(),
  ]);
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'address');
  const title =
    config.network === 'mainnet'
      ? t('meta.label')
      : `TESTNET | ${t('meta.label')}`;

  return new ImageResponse(
    (
      <Wrapper>
        <TitleWrapper>
          <Title small>{title}</Title>
          <SubTitle>{address}</SubTitle>
        </TitleWrapper>
        <AccountBG
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
