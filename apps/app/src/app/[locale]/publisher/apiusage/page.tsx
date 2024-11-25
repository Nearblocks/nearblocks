export const runtime = 'edge';

import { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { notFound } from 'next/navigation';
import React from 'react';

import Chart from '@/components/app/ApiUsage/Chart';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = 'API Usage | NearBlocks';

  const metaDescription =
    'Nearblocks APIs derive data from the Nearblocks NEAR Protocol Block Explorer, providing API endpoints for NEAR Protocol applications.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/publisher/apiusage`,
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
    id?: string;
  }>;
}

export default async function ApiUsage({ searchParams }: Props) {
  const { id } = await searchParams;
  const userRole = (await cookies()).get('role')?.value;
  if (userRole === 'advertiser') {
    notFound();
  }
  return <Chart keyId={id} role={userRole} />;
}
