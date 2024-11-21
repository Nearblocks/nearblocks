export const runtime = 'edge';

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import Keys from '@/components/app/User/Keys';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'API keys | NearBlocks';

  const metaDescription = 'Nearblocks API keys';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    'API keys | NearBlocks',
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/user/keys`,
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

export default async function ApiKeys() {
  const userRole = (await cookies()).get('role')?.value;
  if (userRole === 'publisher') {
    notFound();
  }
  return <Keys role={userRole} />;
}
