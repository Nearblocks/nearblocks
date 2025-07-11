import { Metadata } from 'next';
import { headers } from 'next/headers';
import React from 'react';

import ApiUse from '@/components/app/User/ApiUse';
import { appUrl } from '@/utils/app/config';
import { getUserRole } from '@/utils/app/actions';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = 'API Usage | NearBlocks';

  const metaDescription = 'API Usage in Nearblocks';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/user/apiusage`,
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
  const role = await getUserRole('publisher');
  return <ApiUse id={id} role={role} />;
}
