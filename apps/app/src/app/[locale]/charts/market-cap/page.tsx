import Chart from '@/components/app/Charts/Chart';
import ChartDetails from '@/components/app/skeleton/charts/Detail';
import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata({
  params: { locale },
}: {
  params: { hash: string; locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });

  const metaTitle = t('marketCapCharts.metaTitle');
  const metaDescription = t('marketCapCharts.metaTitle');

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
      canonical: `${appUrl}/charts/market-cap`,
    },
  };
}

export default async function MarketCapChart({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale });
  const data = await getRequest('charts');
  return (
    <section>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t('marketCapCharts.heading')}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="container mx-auto px-3 -mt-36">
          <div className="relative">
            <Suspense fallback={<ChartDetails chartTypes="market-cap" />}>
              <Chart
                poweredBy={false}
                chartTypes={'market-cap'}
                chartsData={data}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
}
