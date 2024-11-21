export const runtime = 'edge';

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import React from 'react';

import Overview from '@/components/app/User/Overview';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Account Overview | NearBlocks';

  const metaDescription =
    'Nearblocks APIs derive data from the Nearblocks NEAR Protocol Block Explorer, providing API endpoints for NEAR Protocol applications.';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    'Account Overview | NearBlocks',
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/user/overview`,
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

export default async function OverviewPage() {
  const userRole = (await cookies()).get('role')?.value;
  return <Overview role={userRole} />;
}
