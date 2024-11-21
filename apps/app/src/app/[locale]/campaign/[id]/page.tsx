export const runtime = 'edge';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

import CampaignEdit from '@/components/app/Campaign/CampaignEdit';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const metaTitle = 'Campaign Edit | NearBlocks';

  const metaDescription = 'Edit Campaign in Nearblocks.';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    'Campaign Edit | NearBlocks',
  )}`;

  const id = (await params).id;

  return {
    alternates: {
      canonical: `${appUrl}/campaign/${id}`,
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

export default async function EditCampaign({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const userRole = (await cookies()).get('role')?.value;
  const id = (await params).id;
  return <CampaignEdit campaignId={id} userRole={userRole} />;
}
