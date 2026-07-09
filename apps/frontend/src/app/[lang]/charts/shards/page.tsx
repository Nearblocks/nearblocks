import type { Metadata } from 'next';

import { ShardsChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchTpsStats } from '@/data/charts';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/shards'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/shards' },
    description: t('shards.meta.description'),
    title: t('shards.meta.title'),
  };
};

const ShardsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchTpsStats();

  return (
    <>
      <PageHeading apiTag="" title={t('shards.heading')} />
      <ErrorSuspense fallback={<ShardsChart loading />}>
        <ShardsChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default ShardsPage;
