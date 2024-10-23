import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

export async function generateMetadata({
  params: { locale },
}: {
  params: { hash: string; locale: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const metaTitle = t('nfts.metaTitle');
  const metaDescription = t('nfts.metaDescription');

  const ogImageUrl = `${ogUrl}/api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 720,
          height: 405,
          alt: metaTitle,
        },
      ],
    },
    alternates: {
      canonical: `${appUrl}/nft-tokentxns`,
    },
  };
}

export default async function NFTTokentxnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return [children];
}
