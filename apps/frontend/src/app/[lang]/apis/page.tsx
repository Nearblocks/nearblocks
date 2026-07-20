/* eslint-disable no-restricted-syntax -- data is fully awaited before render (no streaming boundary), so the segment holds implicitly */
import { Metadata } from 'next';

import { Apis } from '@/components/apis';
import { fetchPlans } from '@/data/plans';
import { hasLocale, translator } from '@/locales/dictionaries';

export const generateMetadata = async ({
  params,
}: PageProps<'/[lang]/apis'>): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'apis');

  return {
    alternates: { canonical: '/apis' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const ApisPage = async () => {
  const plansPromise = fetchPlans();

  return (
    <main className="flex flex-1 flex-col">
      <Apis plansPromise={plansPromise} />
    </main>
  );
};

export default ApisPage;
