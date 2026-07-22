import type { Metadata } from 'next';

import { ContractsChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchAddressStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/contracts'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/contracts' },
    description: t('contracts.meta.description'),
    title: t('contracts.meta.title'),
  };
};

const ContractsChartPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchAddressStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('contracts.heading')} />
      <ErrorSuspense fallback={<ContractsChart loading />}>
        <ContractsChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default ContractsChartPage;
