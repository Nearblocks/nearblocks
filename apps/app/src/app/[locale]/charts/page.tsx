import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

import Chart from '@/components/app/Charts/Chart';
import ChartSkeletion from '@/components/app/skeleton/charts/Index';

export default async function ChartIndex(props: {
  params: Promise<{ hash: string; locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });
  const theme = (await cookies()).get('theme')?.value || 'light';

  return (
    <>
      <div>
        <div className="container-xxl mx-auto p-5">
          <h1 className="text-lg dark:text-neargray-10 text-nearblue-600 font-medium">
            {t('charts.heading')}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-4">
        <div>
          <Suspense fallback={<ChartSkeletion />}>
            <Chart poweredBy={false} theme={theme} />
          </Suspense>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
