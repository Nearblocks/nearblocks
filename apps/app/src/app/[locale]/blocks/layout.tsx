import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata({
  params: { locale },
}: {
  params: { hash: string; locale: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);

  const metaTitle = 'Latest Near Protocol Blocks';
  const metaDescription =
    'All Near (Ⓝ Blocks that are included in Near blockchain. The timestamp, author, gas used, gas price and included transactions are shown.';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

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
      canonical: `${appUrl}/blocks`,
    },
  };
}

export default async function BlockLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return [children];
}
