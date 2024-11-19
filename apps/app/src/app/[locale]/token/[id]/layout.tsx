import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';
import { Token } from '@/utils/types';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { id, locale } = params;

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
    alternates: {
      canonical: `${appUrl}/token/${id}`,
    },
    description: description,
    openGraph: {
      description: description,
      images: [
        {
          alt: title,
          height: 405,
          url: ogImageUrl.toString(),
          width: 720,
        },
      ],
      title: title,
    },
    title: title,
  };
}

export default async function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return [children];
}
