import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';

import Register from '@/components/app/Register';
import { appUrl, networkId } from '@/utils/app/config';
import { getUserDataFromToken } from '@/utils/app/libs';
import { UserToken } from '@/utils/types';
import { getCookie } from '@/utils/app/actions';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = 'Register | NearBlocks';

  const metaDescription = 'Account Registration in Nearblocks';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
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
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function RegisterPage() {
  const token = await getCookie('token');
  const userData: UserToken | null = getUserDataFromToken(token);
  const user = userData?.username;
  if (user) {
    redirect('/user/overview', RedirectType.replace);
  }
  return <Register />;
}
