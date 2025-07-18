import { Metadata } from 'next';
import { headers } from 'next/headers';

import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';
import { MTTokenMeta } from '@/utils/types';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    a: string;
  }>;
}): Promise<Metadata> {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { id } = params;
  const contractAddress = searchParams?.a;

  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const tokenDetails = await getRequest(
    `v2/mts/contract/${contractAddress}/${id}`,
  );

  const token: MTTokenMeta = tokenDetails?.contracts?.[0];

  const title = `${network === 'testnet' ? 'TESTNET ' : ''}${
    token ? `${token?.base?.name} (${token?.base?.symbol}) ` : ''
  }Stats, Price, Holders & Transactions | NearBlocks`;

  const description = token
    ? `All ${token?.base?.name} (${token?.base?.symbol}) information in one place: Statistics, price, market-cap, total & circulating supply, number of holders & latest transactions`
    : 'View detailed statistics, market cap, circulating supply, holders, and transaction data for the token on NearBlocks.';

  const ogImageUrl = `${baseUrl}api/og?mtTokens&tokenHash=${id}&title=${encodeURIComponent(
    title,
  )}`;
  return {
    alternates: {
      canonical: `${appUrl}/mt-token/${id}?a=${contractAddress}`,
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
  return (
    <div className="relative container-xxl mx-auto px-5">
      <section>{children}</section>
    </div>
  );
}
