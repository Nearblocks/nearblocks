import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

import { getRequest } from '@/utils/app/api';
import { appUrl, networkId } from '@/utils/app/config';
import { getRpcProviders } from '@/utils/app/rpc';
import { RpcContextProvider } from '@/components/app/common/RpcContext';

export async function generateMetadata(props: {
  params: Promise<{ hash: string; locale: string }>;
}): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const params = await props.params;

  const { hash, locale } = params;

  const t = await getTranslations({ locale });

  const hashData = await getRequest(`v1/blocks/${hash}`);
  const blockHeight = hashData?.blocks?.[0]?.block_height;

  const metaTitle = t('block.metaTitle', { block: hash });
  const metaDescription = t('block.metaDescription', { block: hash });

  const ogImageUrl = `${baseUrl}api/og?blockHash=true&block_height=${
    blockHeight ? encodeURIComponent(blockHeight) : ''
  }&title=${encodeURIComponent(metaTitle)}`;

  return {
    alternates: {
      canonical: `${appUrl}/blocks/${hash}`,
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

export default async function HashLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const rpcProviders = await getRpcProviders();
  return (
    <RpcContextProvider rpcProviders={rpcProviders}>
      {children}
    </RpcContextProvider>
  );
}
