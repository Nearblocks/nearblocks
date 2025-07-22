import { Metadata } from 'next';
import { headers } from 'next/headers';

import Keys from '@/components/app/User/Keys';
import { appUrl, networkId } from '@/utils/app/config';
import { getUserRole } from '@/utils/app/actions';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = 'API keys | NearBlocks';

  const metaDescription = 'Nearblocks API keys';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/user/keys`,
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

export default async function ApiKeys() {
  const role = await getUserRole('publisher');
  return <Keys role={role} />;
}
