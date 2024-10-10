import List from '@/components/app/Blocks/List';
import ListSkeleton from '@/components/app/skeleton/blocks/list';
import { Suspense } from 'react';
import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';
import { getTranslations } from 'next-intl/server';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale });

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURIComponent(
    t('heading') || 'Latest Near Protocol Blocks',
  )}&brand=near`;

  return {
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${
      t('metaTitle') || 'All Near Latest Protocol Blocks | NearBlocks'
    }`,
    description:
      t('block.metaDescription') ||
      'All Near (Ⓝ Blocks that are included in Near blockchain. The timestamp, author, gas used, gas price and included transactions are shown.',
    openGraph: {
      title:
        t('block.metaTitle') || 'All Near Latest Protocol Blocks | NearBlocks',
      description:
        t('block.metaDescription') ||
        'All Near (Ⓝ Blocks that are included in Near blockchain. The timestamp, author, gas used, gas price and included transactions are shown.',
      images: [thumbnail],
    },
    twitter: {
      title:
        t('block.metaTitle') || 'All Near Latest Protocol Blocks | NearBlocks',
      description:
        t('block.metaDescription') ||
        'All Near (Ⓝ Blocks that are included in Near blockchain. The timestamp, author, gas used, gas price and included transactions are shown.',
      images: [thumbnail],
    },
    alternates: {
      canonical: `${appUrl}/blocks`,
    },
  };
}

export default async function Blocks({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { cursor?: string };
}) {
  const data = await getRequest('blocks', { cursor: searchParams?.cursor });
  const dataCount = await getRequest('blocks/count');
  const t = await getTranslations({ locale });

  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t('blockHeading') || 'Latest Near Protocol Blocks'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full">
            <Suspense fallback={<ListSkeleton />}>
              <List
                data={data}
                totalCount={dataCount}
                apiUrl={'blocks'}
                error={!data}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}

export const revalidate = 20;
