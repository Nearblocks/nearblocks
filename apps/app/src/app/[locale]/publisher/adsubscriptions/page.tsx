import { Metadata } from 'next';
import { headers } from 'next/headers';

import AdSubscription from '@/components/app/Publisher/AdSubscription';
import { appUrl, networkId } from '@/utils/app/config';
import { getUserRole } from '@/utils/app/actions';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = `Ads Subscriptions | NearBlocks`;

  const metaDescription = 'Manage Ads subscriptions in Nearblocks';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/publisher/adsubscriptions`,
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
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function AdSubscriptions() {
  const role = await getUserRole('advertiser');
  return <AdSubscription role={role} />;
}
