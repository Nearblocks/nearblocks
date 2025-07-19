import { Metadata } from 'next';
import { headers } from 'next/headers';

import { getRequest } from '@/utils/app/api';
import { appUrl, networkId } from '@/utils/app/config';
import { MTTokenMeta } from '@/utils/types';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  const decodedId = decodeURIComponent(id);
  const parts = decodedId?.split(':');
  const contract = parts?.[0] ?? '';
  const token = parts?.[1] ?? '';
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const tokenDetails = await getRequest(`v2/mts/contract/${contract}/${token}`);

  const tokenInfo: MTTokenMeta = tokenDetails?.contracts?.[0];

  const title = `${networkId === 'testnet' ? 'TESTNET ' : ''}${
    tokenInfo ? `${tokenInfo?.base?.name} (${tokenInfo?.base?.symbol}) ` : ''
  }Stats, Price, Holders & Transactions | NearBlocks`;

  const description = tokenInfo
    ? `All ${tokenInfo?.base?.name} (${tokenInfo?.base?.symbol}) information in one place: Statistics, price, market-cap, total & circulating supply, number of holders & latest transactions`
    : 'View detailed statistics, market cap, circulating supply, holders, and transaction data for the token on NearBlocks.';

  const ogImageUrl = `${baseUrl}api/og?mtTokens&tokenHash=${token}&title=${encodeURIComponent(
    title,
  )}`;
  return {
    alternates: {
      canonical: `${appUrl}/mt-token/${id}`,
    },
    description: description,
    openGraph: {
      description: description,
      images: [
        {
          alt: title,
          height: 405,
          url: ogImageUrl.toString(),
          width: 720,
        },
      ],
      title: title,
    },
    title: title,
  };
}

export default async function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative container-xxl mx-auto px-5">
      <section>{children}</section>
    </div>
  );
}
