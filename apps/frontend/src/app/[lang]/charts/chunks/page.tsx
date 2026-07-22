import type { Metadata } from 'next';

import { ChunksChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchBlockStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/chunks'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/chunks' },
    description: t('chunks.meta.description'),
    title: t('chunks.meta.title'),
  };
};

const ChunksChartPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchBlockStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('chunks.heading')} />
      <ErrorSuspense fallback={<ChunksChart loading />}>
        <ChunksChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default ChunksChartPage;
