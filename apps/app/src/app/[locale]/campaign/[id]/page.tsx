import { Metadata } from 'next';
import { headers } from 'next/headers';

import CampaignEdit from '@/components/app/Campaign/CampaignEdit';
import { appUrl, networkId } from '@/utils/app/config';
import { getUserRole } from '@/utils/app/actions';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = 'Campaign Edit | NearBlocks';

  const metaDescription = 'Edit Campaign in Nearblocks.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
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
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function EditCampaign({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const id = (await params).id;
  const role = await getUserRole();
  return <CampaignEdit campaignId={id} userRole={role} />;
}
