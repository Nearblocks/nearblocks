import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import NFTDetail from '@/components/app/skeleton/nft/NFTDetail';
import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';
import { Token } from '@/utils/types';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata({
  params: { id, locale, tid },
}: {
  params: { id: string; locale: string; tid: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);

  const tokenDetails = await getRequest(`nfts/${id}`);

  const token: Token = tokenDetails?.tokens?.[0];

  const prefix = network === 'testnet' ? 'TESTNET ' : '';
  const suffix = ' | NearBlocks';
  const metaTitle = token
    ? `NFT ${token.title || token.token} | ${token?.nft?.name}`
    : 'Token Info';
  const title = prefix + metaTitle + suffix;

  const metaDescription = token
    ? `All the details about NFT ${
        token?.title || token?.token
      } from the ${token?.nft
        ?.name} collection : Owner, Contract address, token ID, token standard, description and metadata.`
    : 'Token Info';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/nft-token/${id}/${tid}`,
    },
    description: metaDescription,
    openGraph: {
      description: metaDescription,
      images: [
        {
          alt: title,
          height: 405,
          url: ogImageUrl.toString(),
          width: 720,
        },
      ],
      title: title,
    },
    title: title,
  };
}

export default async function DetailsLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <>
      <Suspense fallback={<NFTDetail />}>{children}</Suspense>
    </>
  );
}
