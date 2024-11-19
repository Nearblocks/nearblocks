export const runtime = 'edge';

import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import Chart from '@/components/app/Charts/Chart';
import ChartSkeletion from '@/components/app/skeleton/charts/Index';

export default async function ChartIndex(props: {
  params: Promise<{ hash: string; locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });

  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white font-medium">
            {t('charts.heading')}
          </h1>
        </div>
      </div>
      <div className="mx-auto px-3 -mt-48">
        <div className="container-xxl mx-auto px-5 -mt-36">
          <div className="relative">
            <Suspense fallback={<ChartSkeletion />}>
              <Chart poweredBy={false} />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
