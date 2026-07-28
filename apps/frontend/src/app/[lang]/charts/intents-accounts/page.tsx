import type { Metadata } from 'next';

import { IntentsAccountsChart } from '@/components/charts/intents-accounts';
import { ErrorSuspense } from '@/components/error-suspense';
import { PageHeading } from '@/components/page-heading';
import { fetchIntentsAccountStats } from '@/data/charts';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/charts/intents-accounts'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');

  return {
    alternates: { canonical: '/charts/intents-accounts' },
    description: t('intentsAccounts.meta.description'),
    title: t('intentsAccounts.meta.title'),
  };
};

const IntentsAccountsPage = async ({ params }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'charts');
  const statsPromise = fetchIntentsAccountStats();
  await holdNav();

  return (
    <>
      <PageHeading apiTag="" title={t('intentsAccounts.heading')} />
      <ErrorSuspense fallback={<IntentsAccountsChart loading />}>
        <IntentsAccountsChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default IntentsAccountsPage;
