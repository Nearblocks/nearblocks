import { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ hash: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const metaTitle = t('nfts.metaTitle');
  const metaDescription = t('nfts.metaDescription');

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/nft-tokentxns`,
    },
    description: metaDescription,
    openGraph: {
      description: metaDescription,
      images: [
        {
          alt: metaTitle,
          height: 405,
          url: ogImageUrl.toString(),
          width: 720,
        },
      ],
      title: metaTitle,
    },
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function NFTTokentxnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return [children];
}
