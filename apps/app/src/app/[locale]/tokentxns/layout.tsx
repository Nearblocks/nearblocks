import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

import { appUrl } from '@/utils/app/config';
import { RpcContextProvider } from '@/components/app/common/RpcContext';
import { getRpcProviders } from '@/utils/app/rpc';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ hash: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const t = await getTranslations({ locale });
  const metaTitle = t('fts.metaTitle');
  const metaDescription = t('fts.metaDescription');

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/tokentxns`,
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

export default async function TokentxnsLayout({
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
