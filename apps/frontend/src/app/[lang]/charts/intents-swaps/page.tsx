import type { Metadata } from 'next';

import { IntentsSwapsChart } from '@/components/charts/intents-swaps';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchIntentsSwapStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/intents-swaps'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/intents-swaps' },
    description: t('intentsSwaps.meta.description'),
    title: t('intentsSwaps.meta.title'),
  };
};

const IntentsSwapsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchIntentsSwapStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('intentsSwaps.heading')} />
      <ErrorSuspense fallback={<IntentsSwapsChart loading />}>
        <IntentsSwapsChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default IntentsSwapsPage;
