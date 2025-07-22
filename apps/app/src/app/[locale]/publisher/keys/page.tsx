import { Metadata } from 'next';
import { headers } from 'next/headers';
import Keys from '@/components/app/Publisher/Keys';
import { appUrl, networkId } from '@/utils/app/config';
import { getUserRole } from '@/utils/app/actions';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = 'API Keys | NearBlocks';

  const metaDescription =
    'Nearblocks APIs derive data from the Nearblocks NEAR Protocol Block Explorer, providing API endpoints for NEAR Protocol applications.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/publisher/keys`,
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

export default async function APIKeys() {
  const role = await getUserRole('advertiser');
  return <Keys role={role} />;
}
