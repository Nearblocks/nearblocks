import { Metadata } from 'next';
import { headers } from 'next/headers';
import Plan from '@/components/app/User/Plan';
import { appUrl, networkId } from '@/utils/app/config';
import { getUserRole } from '@/utils/app/actions';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = 'Current Plan | NearBlocks';

  const metaDescription =
    'Nearblocks APIs derive data from the Nearblocks NEAR Protocol Block Explorer, providing API endpoints for NEAR Protocol applications.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/user/plan`,
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

interface Props {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function CurrentPlan({ searchParams }: Props) {
  const { status } = await searchParams;
  const role = await getUserRole('publisher');
  return <Plan role={role} status={status} />;
}
