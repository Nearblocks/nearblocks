import { notFound } from 'next/navigation';

import { ErrorSuspense } from '@/components/error-suspense';
import { Blocks } from '@/components/home/blocks';
import { Hero } from '@/components/home/hero';
import { Overview } from '@/components/home/overview';
import { Txns } from '@/components/home/txns';
import { fetchBlocks, fetchDailyStats, fetchTxns } from '@/data/home';
import { fetchStats } from '@/data/layout';
import { getDictionary, hasLocale } from '@/locales/dictionaries';
import { LocaleProvider } from '@/providers/locale';

const HomePage = async ({ params }: PageProps<'/[lang]'>) => {
  const { lang } = await params;
  const statsPromise = fetchStats();
  const blocksPromise = fetchBlocks();
  const txnsPromise = fetchTxns();
  const dailyStatsPromise = fetchDailyStats();

  if (!hasLocale(lang)) notFound();

  const dictionary = await getDictionary(lang, ['home']);

  return (
    <LocaleProvider dictionary={dictionary} locale={lang}>
      <main className="flex flex-1 flex-col pb-10">
        <Hero />
        <div className="container mx-auto -mt-12.5 px-4">
          <ErrorSuspense fallback={<Overview />}>
            <Overview
              dailyStatsPromise={dailyStatsPromise}
              statsPromise={statsPromise}
            />
          </ErrorSuspense>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ErrorSuspense fallback={<Blocks loading />}>
              <Blocks blocksPromise={blocksPromise} />
            </ErrorSuspense>
            <ErrorSuspense fallback={<Txns loading />}>
              <Txns txnsPromise={txnsPromise} />
            </ErrorSuspense>
          </div>
        </div>
      </main>
    </LocaleProvider>
  );
};

export default HomePage;
