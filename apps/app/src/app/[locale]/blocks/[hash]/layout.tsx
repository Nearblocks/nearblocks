import { appUrl } from '@/utils/app/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

export async function generateMetadata({
  params,
}: {
  params: { hash: string; locale: string };
}) {
  unstable_setRequestLocale(params?.locale);

  const t = await getTranslations({ locale: params.locale });

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURIComponent(
    t('heading') || 'Latest Near Protocol Blocks',
  )}&brand=near`;

  const metaTitle =
    t('block.metaTitle', { block: params.hash }) ||
    'All Near Latest Protocol Blocks | NearBlocks';
  const metaDescription =
    t('block.metaDescription', { block: params.hash }) ||
    'All Near (Ⓝ Blocks that are included in Near blockchain. The timestamp, author, gas used, gas price and included transactions are shown.';

  return {
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [thumbnail],
    },
    twitter: {
      title: metaTitle,
      description: metaDescription,
      images: [thumbnail],
    },
    alternates: {
      canonical: `${appUrl}/blocks/${params.hash}`,
    },
  };
}

export default async function HaseLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return <>{children}</>;
}
