import { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ hash: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { hash, locale } = params;

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
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function HashLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return [children];
}
