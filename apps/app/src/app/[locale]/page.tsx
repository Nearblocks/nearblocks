import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { Suspense } from 'react';

import Home from '@/components/app/Home/Home';
import HomePageSkeleton from '@/components/app/skeleton/home/Home';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ hash: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;
  const t = await getTranslations({ locale });
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const metaTitle = t('homePage.metaTitle');
  const metaDescription = t('homePage.metaDescription');

  const ogImageUrl = `${baseUrl}api/og?home&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/`,
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
    twitter: {
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
  };
}
export default async function HomeIndex(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const theme = (await cookies()).get('theme')?.value || 'light';

  const { locale } = params;

  return (
    <Suspense fallback={<HomePageSkeleton theme={theme} />}>
      <Home locale={locale} theme={theme} />
    </Suspense>
  );
}
