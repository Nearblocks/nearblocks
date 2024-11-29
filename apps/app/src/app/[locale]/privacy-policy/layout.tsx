import { Metadata } from 'next';
import { headers } from 'next/headers';

import { appUrl } from '@/utils/app/config';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const title = 'Privacy Policy | NearBlocks';

  const description = 'Privacy Policy';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    title,
  )}`;
  return {
    alternates: {
      canonical: `${appUrl}/privacy-policy`,
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

export default async function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return [children];
}
