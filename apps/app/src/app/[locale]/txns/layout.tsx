import { Metadata } from 'next';
import { headers } from 'next/headers';

import { appUrl, networkId } from '@/utils/app/config';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const metaTitle = 'Latest Near Protocol Transactions | NearBlocks';
  const metaDescription =
    'Latest Near Protocol transactions confirmed on Near Blockchain. The list consists of transactions from sending Near and the transactions details for each transaction.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/txns`,
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

export default async function TxnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return [children];
}
