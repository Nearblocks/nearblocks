import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

import Chart from '@/components/app/Charts/Chart';
import ChartDetails from '@/components/app/skeleton/charts/Detail';
import { getRequest } from '@/utils/app/api';

export default async function Tps(props: {
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
          <h1 className="text-lg font-medium dark:text-neargray-10 text-nearblue-600">
            {t('addressesCharts.heading')}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-4">
        <div className="relative">
          <Suspense
            fallback={<ChartDetails chartTypes="active-account-daily" />}
          >
            <Chart
              chartsData={data}
              chartTypes={'active-account-daily'}
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
