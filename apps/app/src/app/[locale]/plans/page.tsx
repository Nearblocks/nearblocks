export const runtime = 'edge';

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import PlanListing from '@/components/app/plans/Listing';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Campaign Plans | NearBlocks';

  const metaDescription = 'Campaign Plans in Nearblocks';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    'Campaign Plans | NearBlocks',
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/plans`,
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

export default async function Plans() {
  const userRole = (await cookies()).get('role')?.value;
  if (userRole === 'advertiser') {
    notFound();
  }
  return <PlanListing userRole={userRole} />;
}
