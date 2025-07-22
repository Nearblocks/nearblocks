import { Metadata } from 'next';
import { headers } from 'next/headers';

import { getRequest } from '@/utils/app/api';
import { appUrl, networkId } from '@/utils/app/config';
import { Token } from '@/utils/types';
import { getRpcProviders } from '@/utils/app/rpc';
import { RpcContextProvider } from '@/components/app/common/RpcContext';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { id } = params;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const tokenDetails = await getRequest(`v1/fts/${id}`);

  const token: Token = tokenDetails?.contracts?.[0];

  const title = `${networkId === 'testnet' ? 'TESTNET ' : ''}${
    token ? `${token.name} (${token.symbol}) ` : ''
  }Stats, Price, Holders & Transactions | NearBlocks`;

  const description = token
    ? `All ${token.name} (${token.symbol}) information in one place: Statistics, price, market-cap, total & circulating supply, number of holders & latest transactions`
    : 'View detailed statistics, market cap, circulating supply, holders, and transaction data for the token on NearBlocks.';

  const ogImageUrl = `${baseUrl}api/og?token&tokenHash=${id}&title=${encodeURIComponent(
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
  const rpcProviders = await getRpcProviders();
  return (
    <div className="relative container-xxl mx-auto px-5">
      <RpcContextProvider rpcProviders={rpcProviders}>
        {children}
      </RpcContextProvider>
    </div>
  );
}
