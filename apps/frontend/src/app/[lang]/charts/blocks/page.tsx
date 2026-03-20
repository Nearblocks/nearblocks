import type { Metadata } from 'next';

import { BlocksChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/blocks'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  return {
    alternates: { canonical: '/charts/blocks' },
    description: t('blocks.meta.description'),
    title: t('blocks.meta.title'),
  };
};

const BlocksChartPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">{t('blocks.heading')}</h1>
      <ErrorSuspense fallback={<BlocksChart loading />}>
        <BlocksChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default BlocksChartPage;
