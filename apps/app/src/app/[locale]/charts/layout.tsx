import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata({
  params: { locale },
}: {
  params: { hash: string; locale: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const metaTitle = t('charts.metaTitle');
  const metaDescription = t('charts.metaDescription');

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    t('charts.heading'),
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
      canonical: `${appUrl}/charts`,
    },
  };
}

export default async function ChartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return [children];
}
