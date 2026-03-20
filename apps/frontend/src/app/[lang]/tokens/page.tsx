import { ErrorSuspense } from '@/components/error-suspense';
import { Tokens } from '@/components/tokens';
import { fetchTokenCount, fetchTokens } from '@/data/tokens';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/tokens'>;

const TokensPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'fts');
  const filters = await searchParams;
  const tokensPromise = fetchTokens(filters);
  const tokenCountPromise = fetchTokenCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-6">{t('title')}</h1>
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
