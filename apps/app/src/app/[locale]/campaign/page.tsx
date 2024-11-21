export const runtime = 'edge';

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import React from 'react';

import CampaignPage from '@/components/app/Campaign/CampaignPage';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Campaign | NearBlocks';

  const metaDescription = 'Campaign in nearblocks';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    'Campaign | NearBlocks',
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/campaign`,
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

export default async function Campaign() {
  const userRole = (await cookies()).get('role')?.value;
  return <CampaignPage userRole={userRole} />;
}
