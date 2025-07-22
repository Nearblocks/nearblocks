import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import MultiChainSkeleton from '@/components/app/skeleton/Multichain/multiChainSkeleton';
import { appUrl, networkId } from '@/utils/app/config';

export async function generateMetadata(props: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;

  const t = await getTranslations({ locale });
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const metaTitle = `${t('metaTitle')} | NearBlocks`;

  const metaDescription = `${t('metaDescription')}`;

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    t('heading'),
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/multi-chain-txns`,
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

export default async function TokensLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale });
  const { children } = props;

  return (
    <section>
      <div>
        <div className="container-xxl mx-auto p-5">
          <h1 className="text-lg font-medium dark:text-neargray-10 text-nearblue-600">
            {t ? t('heading') : 'Latest Multichain Transactions'}
          </h1>
        </div>
      </div>
      <div className="container-xxl mx-auto px-4">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full ">
            <ErrorBoundary fallback={<MultiChainSkeleton error />}>
              <Suspense fallback={<MultiChainSkeleton />}>{children}</Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
}
