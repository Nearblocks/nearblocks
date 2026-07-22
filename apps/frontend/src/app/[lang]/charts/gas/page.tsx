import type { Metadata } from 'next';

import { GasChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchBlockStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/gas'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/gas' },
    description: t('gas.meta.description'),
    title: t('gas.meta.title'),
  };
};

const GasChartPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchBlockStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('gas.heading')} />
      <ErrorSuspense fallback={<GasChart loading />}>
        <GasChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default GasChartPage;
