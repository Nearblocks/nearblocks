export const runtime = 'edge';

import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import Register from '@/components/app/Register';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(): Promise<Metadata> {
  const metaTitle = 'Register | NearBlocks';

  const metaDescription = 'Account Registration in Nearblocks';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    'Register | NearBlocks',
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/register`,
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

export default async function RegisterPage() {
  const token = (await cookies()).get('token')?.value;
  const role = (await cookies()).get('role')?.value;
  const user = (await cookies()).get('user')?.value;
  if (token && role && user) {
    redirect('/user/overview');
  }
  return <Register />;
}
