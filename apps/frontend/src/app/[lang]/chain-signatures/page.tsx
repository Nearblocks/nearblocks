import type { Metadata } from 'next';

import { Operators } from '@/components/chain-signatures/operators';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchMpcs } from '@/data/chain-signatures';
import { holdNav } from '@/lib/hold-nav';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/chain-signatures'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'chainSignatures');

  return {
    alternates: { canonical: '/chain-signatures' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const ChainSignaturesPage = async () => {
  const mpcsPromise = fetchMpcs();
  await holdNav();

  return (
    <ErrorSuspense fallback={<Operators loading />}>
      <Operators mpcsPromise={mpcsPromise} />
    </ErrorSuspense>
  );
};

export default ChainSignaturesPage;
