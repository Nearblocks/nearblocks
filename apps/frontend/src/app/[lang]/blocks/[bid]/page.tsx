import type { Metadata } from 'next';

import { Overview } from '@/components/blocks/overview';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchBlock } from '@/data/blocks';
import { hasLocale, translator } from '@/locales/dictionaries';

type Props = PageProps<'/[lang]/blocks/[bid]'>;

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { bid, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'blocks');

  return {
    alternates: { canonical: `/blocks/${bid}` },
    description: t('bidMeta.description', { bid }),
    title: t('bidMeta.title', { bid }),
  };
};

const BlockPage = async ({ params }: Props) => {
  const { bid, lang } = await params;
  const locale = hasLocale(lang) ? lang : 'en';
  const t = await translator(locale, 'blocks');
  const blockPromise = fetchBlock(bid);

  return (
    <>
      <h1 className="text-headline-lg mb-4">
        {t('overview.heading')}{' '}
        <span className="text-muted-foreground text-headline-base">#{bid}</span>
      </h1>
      <ErrorSuspense fallback={<Overview loading />}>
        <Overview blockPromise={blockPromise} />
      </ErrorSuspense>
    </>
  );
};

export default BlockPage;
