import { Metadata } from 'next';
import { headers } from 'next/headers';

import Invoice from '@/components/app/User/Invoice';
import { appUrl } from '@/utils/app/config';
import { getUserRole } from '@/utils/app/actions';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = 'Invoices | NearBlocks';

  const metaDescription = 'Nearblocks Invoices';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
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
  const role = await getUserRole();
  return <Invoice role={role} />;
}
