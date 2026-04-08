import { Metadata } from 'next';

import { Charts } from '@/components/charts';
import { fetchDailyStats } from '@/data/charts';
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

  return (
    <>
      <h1 className="text-headline-lg mb-4">{t('title')}</h1>
      <Charts statsPromise={statsPromise} />
    </>
  );
};

export default ChartsPage;
