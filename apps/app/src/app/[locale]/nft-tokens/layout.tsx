import { Metadata } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';

import NFTTokensSkeleton from '@/components/app/skeleton/nft/NFTTokensSkeleton';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const metaTitle =
    'Non-Fungible (NEP-171) Tokens (NFT) Token Tracker | NearBlocks';
  const metaDescription =
    'The list of Non-Fungible (NEP-171) Tokens (NFT) and their daily transfers in the Near Protocol on NearBlocks';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/nft-tokens`,
    },
    description: metaDescription,
    openGraph: {
      description: metaDescription,
      images: [
        {
          alt: metaTitle,
          height: 405,
          url: ogImageUrl.toString(),
          width: 720,
        },
      ],
      title: metaTitle,
    },
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function TokensLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <section>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container-xxl mx-auto px-5">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10 font-medium">
            Non-Fungible Token Tracker (NEP-171)
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-5 -mt-48 ">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full ">
            <Suspense fallback={<NFTTokensSkeleton />}>{children}</Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
}
