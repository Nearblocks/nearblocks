import type { Metadata } from 'next';

import { SupplyChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchBlockStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/near-supply'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/near-supply' },
    description: t('nearSupply.meta.description'),
    title: t('nearSupply.meta.title'),
  };
};

const NearSupplyPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchBlockStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('nearSupply.heading')} />
      <ErrorSuspense fallback={<SupplyChart loading />}>
        <SupplyChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default NearSupplyPage;
