import { ErrorSuspense } from '@/components/error-suspense';
import { RpcSelector } from '@/components/rpc';
import { Validators } from '@/components/validators';
import { fetchBlocks } from '@/data/home';
import { fetchStats } from '@/data/layout';
import { fetchValidators } from '@/data/validators';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/validators'>;

const ValidatorsPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'validators');
  const filters = await searchParams;
  const validatorsPromise = fetchValidators(filters);
  const statsPromise = fetchStats();
  const latestBlocksPromise = fetchBlocks();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-headline-lg">{t('title')}</h1>
        <RpcSelector />
      </div>
      <ErrorSuspense fallback={<Validators loading />}>
        <Validators
          latestBlocksPromise={latestBlocksPromise}
          statsPromise={statsPromise}
          validatorsPromise={validatorsPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default ValidatorsPage;
