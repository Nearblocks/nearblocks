import { Metadata } from 'next';
import { headers } from 'next/headers';

import { appUrl, networkId } from '@/utils/app/config';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = 'Near Protocol API & Documentation | NearBlocks ';
  const metaDescription =
    "NearBlocks APIs derives data from NearBlock's Near Protocol (NEAR) Block Explorer to cater for Near Protocol applications through API Endpoints.";

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/blocks`,
    },
    description: metaDescription,
    openGraph: {
      description: metaDescription,
      images: [
        {
          alt: metaTitle,
          height: 405,
          url: ogImageUrl,
          width: 720,
        },
      ],
      title: metaTitle,
    },
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function BlockLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return [children];
}
