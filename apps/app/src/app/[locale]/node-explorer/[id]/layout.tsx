import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

export async function generateMetadata({
  params: { id },
}: {
  params: { id: string };
}): Promise<Metadata> {
  const metaTitle = `${network === 'testnet' ? 'TESTNET ' : ''}${
    id ? `${id}: ` : ''
  } delegators | NearBlocks`;
  const metaDescription = id
    ? `Node Validator ${id} (${id}) Delegators Listing`
    : '';

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
      canonical: `${appUrl}/node-explorer/${id}`,
    },
  };
}

export default async function DelegatorLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return [children];
}
