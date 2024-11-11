import List from '@/components/app/Blocks/List';
import ListSkeleton from '@/components/app/skeleton/blocks/list';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

export default async function Blocks({
  params: { locale },
  searchParams: { cursor },
}: {
  params: { locale: string };
  searchParams: { cursor?: string };
}) {
  const t = await getTranslations({ locale });

  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-white text-lg font-medium">
            {t('blockHeading') || 'Latest Near Protocol Blocks'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full">
            <Suspense fallback={<ListSkeleton />}>
              <List cursor={cursor || ''} />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
