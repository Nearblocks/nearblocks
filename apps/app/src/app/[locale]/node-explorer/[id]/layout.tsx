import { Metadata } from 'next';
import { headers } from 'next/headers';

import { appUrl } from '@/utils/app/config';
import { RpcContextProvider } from '@/components/app/common/RpcContext';
import { getRpcProviders } from '@/utils/app/rpc';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { id } = params;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const metaTitle = `${network === 'testnet' ? 'TESTNET ' : ''}${
    id ? `${id}: ` : ''
  } delegators | NearBlocks`;
  const metaDescription = id
    ? `Node Validator ${id} (${id}) Delegators Listing`
    : '';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/node-explorer/${id}`,
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

export default async function DelegatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rpcProviders = await getRpcProviders();
  return (
    <RpcContextProvider rpcProviders={rpcProviders}>
      {children}
    </RpcContextProvider>
  );
}
