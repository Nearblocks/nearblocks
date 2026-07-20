import type { Metadata } from 'next';

import { TpsChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchTpsStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/tps'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/tps' },
    description: t('tps.meta.description'),
    title: t('tps.meta.title'),
  };
};

const TpsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchTpsStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('tps.heading')} />
      <ErrorSuspense fallback={<TpsChart loading />}>
        <TpsChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default TpsPage;
