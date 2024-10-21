import NFTDetail from '@/components/app/skeleton/nft/NFTDetail';
import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';
import { Token } from '@/utils/types';
import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

export async function generateMetadata({
  params: { id, tid, locale },
}: {
  params: { id: string; tid: string; locale: string };
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

  const ogImageUrl = `${ogUrl}/api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    title: title,
    description: metaDescription,
    openGraph: {
      title: title,
      description: metaDescription,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 720,
          height: 405,
          alt: title,
        },
      ],
    },
    alternates: {
      canonical: `${appUrl}/nft-token/${id}/${tid}`,
    },
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
