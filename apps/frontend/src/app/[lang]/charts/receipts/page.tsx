import type { Metadata } from 'next';

import { ReceiptsChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchTxnStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/receipts'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/receipts' },
    description: t('receipts.meta.description'),
    title: t('receipts.meta.title'),
  };
};

const ReceiptsChartPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchTxnStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('receipts.heading')} />
      <ErrorSuspense fallback={<ReceiptsChart loading />}>
        <ReceiptsChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default ReceiptsChartPage;
