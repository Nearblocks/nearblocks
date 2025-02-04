import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { Suspense } from 'react';

import Chart from '@/components/app/Charts/Chart';
import ChartDetails from '@/components/app/skeleton/charts/Detail';
import { getRequest } from '@/utils/app/api';
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

  const metaTitle = t('txnsCharts.metaTitle');
  const metaDescription = t('txnsCharts.metaDescription');

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    t('charts.heading'),
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/charts/txns`,
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

export default async function TxnsChart(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });
  const data = await getRequest('charts');
  const theme = (await cookies()).get('theme')?.value || 'light';

  return (
    <section>
      <div>
        <div className="container-xxl mx-auto p-5">
          <h1 className="text-lg font-bold dark:text-neargray-10 text-nearblue-600">
            {t('txnsCharts.heading')}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5">
        <div className="relative">
          <Suspense fallback={<ChartDetails chartTypes="txns" />}>
            <Chart
              chartsData={data}
              chartTypes={'txns'}
              poweredBy={false}
              theme={theme}
            />
          </Suspense>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
}
