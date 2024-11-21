export const runtime = 'edge';

import { Metadata } from 'next';
import { cookies } from 'next/headers';

import Invoice from '@/components/app/User/Invoice';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Invoices | NearBlocks';

  const metaDescription = 'Nearblocks Invoices';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    'Invoices | NearBlocks',
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/user/invoices`,
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

export default async function Invoices() {
  const userRole = (await cookies()).get('role')?.value;
  return <Invoice role={userRole} />;
}
