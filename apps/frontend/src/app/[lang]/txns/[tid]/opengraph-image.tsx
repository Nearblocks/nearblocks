import { ImageResponse } from 'next/og';

import { SubTitle, Title, TitleWrapper, Wrapper } from '@/components/thumbnail';
import { TxnBG } from '@/icons/og';
import { getRuntimeConfig } from '@/lib/config';
import { hasLocale, translator } from '@/locales/dictionaries';

export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200,
};

type Props = PageProps<'/[lang]/txns/[tid]'>;

const Image = async ({ params }: Props) => {
  const [{ lang, tid }, config] = await Promise.all([
    params,
    getRuntimeConfig(),
  ]);
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'txns');
  const title =
    config.networkId === 'mainnet'
      ? t('tidMeta.label')
      : `TESTNET ${t('tidMeta.label')}`;

  return new ImageResponse(
    (
      <Wrapper>
        <TitleWrapper>
          <Title small>{title}</Title>
          <SubTitle>{tid}</SubTitle>
        </TitleWrapper>
        <TxnBG
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
