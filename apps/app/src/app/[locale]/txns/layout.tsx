import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ hash: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  unstable_setRequestLocale(locale);

  const metaTitle = 'All Latest Near Protocol Transactions | NearBlocks';
  const metaDescription =
    'All Latest Near Protocol transactions confirmed on Near Blockchain. The list consists of transactions from sending Near and the transactions details for each transaction.';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
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
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function TxnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return [children];
}
