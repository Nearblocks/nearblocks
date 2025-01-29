import { Metadata } from 'next';
import { headers } from 'next/headers';
import React from 'react';

import CampaignChart from '@/components/app/Campaign/CampaignChart';
import { appUrl } from '@/utils/app/config';
import { getUserRole } from '@/utils/app/actions';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = 'Campaign Charts | NearBlocks';

  const metaDescription = 'Campaign Charts in Nearblocks';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/campaign/chart`,
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

interface Props {
  searchParams: Promise<{
    id: string;
  }>;
}

export default async function ChartPage({ searchParams }: Props) {
  const id = (await searchParams).id;
  const role = await getUserRole();
  return <CampaignChart campaignId={id} userRole={role} />;
}
