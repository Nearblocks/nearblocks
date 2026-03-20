import { Blocks } from '@/components/blocks';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchBlockCount, fetchBlocks } from '@/data/blocks';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/blocks'>;

const BlocksPage = async ({ params, searchParams }: Props) => {
  const { lang } = await params;
  const filters = await searchParams;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'blocks');
  const blocksPromise = fetchBlocks(filters);
  const blockCountPromise = fetchBlockCount();

  return (
    <>
      <h1 className="text-headline-lg mb-6">{t('heading')}</h1>
      <ErrorSuspense fallback={<Blocks loading />}>
        <Blocks
          blockCountPromise={blockCountPromise}
          blocksPromise={blocksPromise}
        />
      </ErrorSuspense>
    </>
  );
};

export default BlocksPage;
