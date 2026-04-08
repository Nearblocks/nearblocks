import { Metadata } from 'next';

import { ErrorSuspense } from '@/components/error-suspense';
import { Tokens } from '@/components/tokens';
import { fetchTokenCount, fetchTokens } from '@/data/tokens';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/tokens'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'fts');

  return {
    alternates: { canonical: '/tokens' },
    description: t('meta.description'),
    title: t('meta.title'),
  };
};

const TokensPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'fts');
  const filters = await searchParams;
  const tokensPromise = fetchTokens(filters);
  const tokenCountPromise = fetchTokenCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-4">{t('title')}</h1>
      <ErrorSuspense fallback={<Tokens loading />}>
        <Tokens
          tokenCountPromise={tokenCountPromise}
          tokensPromise={tokensPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default TokensPage;
