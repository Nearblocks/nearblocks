import TokensSkeleton from '@/components/app/skeleton/ft/Tokens';
import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

export async function generateMetadata({
  params: { locale },
}: {
  params: { hash: string; locale: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);

  const metaTitle =
    'Non-Fungible (NEP-171) Tokens (NFT) Token Tracker | NearBlocks';
  const metaDescription =
    'The list of Non-Fungible (NEP-171) Tokens (NFT) and their daily transfers in the Near Protocol on NearBlocks';

  const ogImageUrl = `${ogUrl}/api/og?basic=true&title=${encodeURIComponent(
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
      canonical: `${appUrl}/nft-tokens`,
    },
  };
}

export default async function TokensLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <section>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
            Non-Fungible Token Tracker (NEP-171)
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48 ">
        <div className="relative block lg:flex lg:space-x-2">
          <div className="w-full ">
            <Suspense fallback={<TokensSkeleton />}>{children}</Suspense>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
}
