import { ImageResponse } from 'next/og';

import { SubTitle, Title, TitleWrapper, Wrapper } from '@/components/thumbnail';
import { BlockBG } from '@/icons/og';
import { getRuntimeConfig } from '@/lib/config';
import { numberFormat } from '@/lib/format';
import { hasLocale, translator } from '@/locales/dictionaries';

export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200,
};

type Props = PageProps<'/[lang]/blocks/[bid]'>;

const Image = async ({ params }: Props) => {
  const [{ bid, lang }, config] = await Promise.all([
    params,
    getRuntimeConfig(),
  ]);
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'blocks');
  const title =
    config.network === 'mainnet'
      ? t('bidMeta.label')
      : `TESTNET | ${t('bidMeta.label')}`;

  return new ImageResponse(
    (
      <Wrapper>
        <TitleWrapper>
          <Title small>{title}</Title>
          <SubTitle>{/^\d+$/.test(bid) ? numberFormat(bid) : bid}</SubTitle>
        </TitleWrapper>
        <BlockBG
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
