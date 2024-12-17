import { getTranslations } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { Suspense } from 'react';

import Chart from '@/components/app/Charts/Chart';
import ChartDetails from '@/components/app/skeleton/charts/Detail';
import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
export async function generateMetadata(props: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;

  const t = await getTranslations({ locale });
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const metaTitle = t('multichainTxns.metaTitle');
  const metaDescription = t('multichainTxns.metaDescription');

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    t('multichainTxns.heading'),
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/charts/multi-chain-txns`,
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

export default async function AddressesChart() {
  const data = await getRequest('charts');
  const theme = (await cookies()).get('theme')?.value || 'light';

  return (
    <section>
      <div className="bg-hero-pattern  dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {'Multi Chain Transactions Chart'}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48">
        <div className="container-xxl mx-auto px-5 -mt-36">
          <div className="relative">
            <Suspense fallback={<ChartDetails chartTypes="addresses" />}>
              <Chart
                chartsData={data}
                chartTypes={'multi-chain-txns'}
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
