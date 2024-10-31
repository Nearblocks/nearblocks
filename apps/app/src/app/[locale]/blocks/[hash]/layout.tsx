import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata({
  params: { hash, locale },
}: {
  params: { hash: string; locale: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);

  const t = await getTranslations({ locale });

  const hashData = await getRequest(`blocks/${hash}`);
  const blockHeight = hashData?.blocks[0]?.block_height;

  const metaTitle = t('block.metaTitle', { block: hash });
  const metaDescription = t('block.metaDescription', { block: hash });

  const ogImageUrl = `${appUrl}/api/og?blockHash=true&block_height=${encodeURIComponent(
    blockHeight,
  )}&title=${encodeURIComponent(metaTitle)}`;

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
      canonical: `${appUrl}/blocks/${hash}`,
    },
  };
}

export default async function HashLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return <>{children}</>;
}
