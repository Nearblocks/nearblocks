import { Metadata } from 'next';

import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'DEX Tracker | NearBlocks';
  const metaDescription =
    'All Near (Ⓝ Blocks that are included in Near blockchain. The timestamp, author, gas used, gas price and included transactions are shown.';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/dex`,
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

export default async function DexLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return [children];
}
