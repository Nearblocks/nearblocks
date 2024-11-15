export const runtime = 'edge';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import Chart from '@/components/app/Charts/Chart';
import ChartDetails from '@/components/app/skeleton/charts/Detail';
import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata({
  params: { locale },
}: {
  params: { hash: string; locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });

  const metaTitle = t('charts.nearPrice.metaTitle');
  const metaDescription = t('charts.nearPrice.metaDescription');

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    t('charts.heading'),
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/charts/near-price`,
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

export default async function NearPriceChart({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale });
  const data = await getRequest('charts');
  return (
    <section>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t('charts.nearPrice.heading')}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48">
        <div className="container-xxl mx-auto px-5 -mt-36">
          <div className="relative">
            <Suspense fallback={<ChartDetails chartTypes="near-price" />}>
              <Chart
                chartsData={data}
                chartTypes={'near-price'}
                poweredBy={false}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
}
