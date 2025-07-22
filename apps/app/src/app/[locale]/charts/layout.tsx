import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

import { appUrl, networkId } from '@/utils/app/config';

export async function generateMetadata(props: {
  params: Promise<{ hash: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const metaTitle = t('charts.metaTitle');
  const metaDescription = t('charts.metaDescription');

  const ogImageUrl = `${baseUrl}api/og?basic&title=${encodeURIComponent(
    t('charts.heading'),
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/charts`,
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
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function ChartsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return [children];
}
