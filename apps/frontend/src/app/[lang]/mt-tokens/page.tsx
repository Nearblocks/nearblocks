import { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { MtTokens } from '@/components/mt-tokens';
import { PageHeading } from '@/components/page-heading';
import { fetchMTList, fetchMTListCount } from '@/data/mt-tokens';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/mt-tokens'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');

  return {
    alternates: { canonical: '/mt-tokens' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const MtTokensPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'mts');
  const filters = await searchParams;
  const mtListPromise = fetchMTList(filters);
  const mtListCountPromise = fetchMTListCount(filters);

  return (
    <>
      <PageHeading apiTag="mts" title={t('title')} />
      <ErrorSuspense fallback={<MtTokens loading />}>
        <MtTokens
          mtListCountPromise={mtListCountPromise}
          mtListPromise={mtListPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default MtTokensPage;
