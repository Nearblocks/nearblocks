export const runtime = 'edge';

import { Metadata } from 'next';
import { cookies } from 'next/headers';

import Setting from '@/components/app/User/Setting';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Account Settings | NearBlocks';

  const metaDescription =
    'Nearblocks APIs derive data from the Nearblocks NEAR Protocol Block Explorer, providing API endpoints for NEAR Protocol applications.';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    'Account Settings | NearBlocks',
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/user/settings`,
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

export default async function Settings() {
  const userRole = (await cookies()).get('role')?.value;
  return <Setting role={userRole} />;
}
