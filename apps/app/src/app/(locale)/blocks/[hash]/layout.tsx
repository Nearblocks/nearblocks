'use client';

import { appUrl } from '@/app/utils/config';
import Head from 'next/head';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

// Simulated absence of the translation function
const t = (key: string, p?: any): any => {
  p = {};
  const simulateAbsence = true; // Set to true to simulate absence of t
  return simulateAbsence ? undefined : { key, p }; // Return undefined to simulate absence
};

export default function HaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  // const t = useTranslations();

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURIComponent(
    t('blocks:heading') || 'Latest Near Protocol Blocks',
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>{`${network === 'testnet' ? 'TESTNET' : ''} ${t(
          'blocks:block.metaTitle',
          { block: params.hash },
        )}`}</title>
        <meta
          name="title"
          content={t('blocks:block.metaTitle', { block: params.hash })}
        />
        <meta
          name="description"
          content={t('blocks:block.metaDescription', { block: params.hash })}
        />
        <meta
          property="og:title"
          content={t('blocks:block.metaTitle', { block: params.hash })}
        />
        <meta
          property="og:description"
          content={t('blocks:block.metaDescription', { block: params.hash })}
        />
        <meta
          property="twitter:title"
          content={t('blocks:block.metaTitle', { block: params.hash })}
        />
        <meta
          property="twitter:description"
          content={t('blocks:block.metaDescription', { block: params.hash })}
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="og:image:secure_url" content={thumbnail} />
        <meta name="twitter:image:src" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/blocks/${params.hash}`} />
      </Head>

      {children}
    </>
  );
}
