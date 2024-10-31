import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata({
  params: { locale },
}: {
  params: { hash: string; locale: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);

  const metaTitle = 'All Latest Near Protocol Transactions | NearBlocks';
  const metaDescription =
    'All Latest Near Protocol transactions confirmed on Near Blockchain. The list consists of transactions from sending Near and the transactions details for each transaction.';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 720,
          height: 405,
          alt: metaTitle,
        },
      ],
    },
    alternates: {
      canonical: `${appUrl}/txns`,
    },
  };
}

export default async function TxnsLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return <>{children}</>;
}
