import { ErrorSuspense } from '@/components/error-suspense';
import { Txns } from '@/components/txns';
import { fetchTxnCount, fetchTxns } from '@/data/txns';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/txns'>;

const TxnsPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'txns');
  const filters = await searchParams;
  const txnsPromise = fetchTxns(filters);
  const txnCountPromise = fetchTxnCount(filters);

  return (
    <>
      <h1 className="text-headline-lg mb-6">{t('title')}</h1>
      <ErrorSuspense fallback={<Txns loading />}>
        <Txns txnCountPromise={txnCountPromise} txnsPromise={txnsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default TxnsPage;
