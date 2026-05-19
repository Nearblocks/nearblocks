import { Metadata } from 'next';

import { Charts } from '@/components/charts';
import { PageHeading } from '@/components/page-heading';
import { fetchDailyStats, fetchTpsStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const ChartsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchDailyStats(14);
  const tpsStatsPromise = fetchTpsStats();

  return (
    <>
      <PageHeading apiTag="" title={t('title')} />
      <Charts statsPromise={statsPromise} tpsStatsPromise={tpsStatsPromise} />
    </>
  );
};

export default ChartsPage;
