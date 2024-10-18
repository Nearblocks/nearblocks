import { getRequest } from '@/utils/app/api';
import { appUrl } from '@/utils/app/config';
import { Token } from '@/utils/types';
import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

export async function generateMetadata({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);

  const tokenDetails = await getRequest(`nfts/${id}`);

  const token: Token = tokenDetails?.contracts?.[0];

  const title = `${network === 'testnet' ? 'TESTNET ' : ''}${
    token ? `${token.name} (${token.symbol}) ` : ''
  }NFT Stats, Holders & Transactions | NearBlocks`;

  const description = token
    ? `All you need to know about the ${token.name} NFT Collection : Statistics, total supply, number of holders, latest transactions & meta-data.`
    : '';

  const ogImageUrl = `${ogUrl}/api/og?basic=true&title=${encodeURIComponent(
    title,
  )}`;
  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 720,
          height: 405,
          alt: title,
        },
      ],
    },
    alternates: {
      canonical: `${appUrl}/token/${id}`,
    },
  };
}

export default async function NFTTokenLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return <>{children}</>;
}
