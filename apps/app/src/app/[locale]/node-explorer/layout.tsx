import { Metadata } from 'next';
import { headers } from 'next/headers';

import { appUrl, networkId } from '@/utils/app/config';
import { getRpcProviders } from '@/utils/app/rpc';
import { RpcContextProvider } from '@/components/app/common/RpcContext';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const metaTitle = 'NEAR Validator List | Nearblocks';
  const metaDescription = '';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/node-explorer`,
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

export default async function ExplorerLayout({
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
