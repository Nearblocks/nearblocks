export const runtime = 'edge';

import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import List from '@/components/app/Blocks/List';
import ListSkeleton from '@/components/app/skeleton/blocks/list';

export default async function Blocks(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ cursor?: string }>;
}) {
  const searchParams = await props.searchParams;

  const { cursor } = searchParams;

  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });

  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-white text-lg font-medium">
            {t('blockHeading') || 'Latest Near Protocol Blocks'}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48">
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
