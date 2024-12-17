import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { Suspense } from 'react';

import TpsChart from '@/components/app/Charts/TpsChart';
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

  const metaTitle = 'Near Transactions per Second Chart';
  const metaDescription =
    'Near Transactions per Second Chart shows the transactions occuring per second on Near blockchain.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    t('charts.heading'),
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/charts/tps`,
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

export default async function Tps() {
  const data = await getRequest('charts/tps');
  const theme = (await cookies()).get('theme')?.value || 'light';
  return (
    <section>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            Near Transactions per Second Chart
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48">
        <div className="container-xxl mx-auto px-5 -mt-36">
          <div className="relative">
            <Suspense fallback={<ChartDetails chartTypes="near-tps" />}>
              <TpsChart
                chartTypes={'near-tps'}
                data={data}
                poweredBy={false}
                theme={theme}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
}
