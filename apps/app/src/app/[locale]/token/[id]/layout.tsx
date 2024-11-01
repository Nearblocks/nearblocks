import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';
import { Token } from '@/utils/types';
import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);

  const tokenDetails = await getRequest(`fts/${id}`);

  const token: Token = tokenDetails?.contracts?.[0];

  const title = `${network === 'testnet' ? 'TESTNET ' : ''}${
    token ? `${token.name} (${token.symbol}) ` : ''
  }Stats, Price, Holders & Transactions | NearBlocks`;

  const description = token
    ? `All ${token.name} (${token.symbol}) information in one place: Statistics, price, market-cap, total & circulating supply, number of holders & latest transactions`
    : 'View detailed statistics, market cap, circulating supply, holders, and transaction data for the token on NearBlocks.';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    title,
  )}`;
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 720,
          height: 405,
          alt: title,
        },
      ],
    },
    alternates: {
      canonical: `${appUrl}/token/${id}`,
    },
  };
}

export default async function TokenLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return <>{children}</>;
}
