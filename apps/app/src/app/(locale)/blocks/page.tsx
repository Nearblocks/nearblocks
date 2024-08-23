import List from '@/app/_components/Blocks/List';
import ListSkeleton from '@/app/_components/skeleton/blocks/list';
import { getRequest } from '@/app/utils/api';
import { appUrl } from '@/app/utils/config';
import { Suspense } from 'react';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

// Simulated absence of the translation function
const t = (key: string, p?: any): string | undefined => {
  p = {};
  const simulateAbsence = true; // Set to true to simulate absence of t
  return simulateAbsence ? undefined : key; // Return undefined to simulate absence
};

export async function generateMetadata({} // params,
: {
  params: { locale: string };
}) {
  // Set the request locale based on the URL parameter
  // unstable_setRequestLocale(params?.locale);

  // const t = await getTranslations({ locale: params.locale });

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
  // params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { cursor?: string };
}) {
  // Set the request locale based on the URL parameter
  // unstable_setRequestLocale(params?.locale);

  // const t = await getTranslations({ locale: params.locale });

  // Fetch data for blocks and block count
  const data = await getRequest('blocks', { cursor: searchParams?.cursor });
  const dataCount = await getRequest('blocks/count');

  console.log({ blockData: data });

  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t('heading') || 'Latest Near Protocol Blocks'}
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
