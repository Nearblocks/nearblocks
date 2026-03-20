import { Charts } from '@/components/charts';
import { fetchDailyStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts'>;

const ChartsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchDailyStats(14);

  return (
    <>
      <h1 className="text-headline-lg mb-6">{t('title')}</h1>
      <Charts statsPromise={statsPromise} />
    </>
  );
};

export default ChartsPage;
