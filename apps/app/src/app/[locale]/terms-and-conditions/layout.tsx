import { Metadata } from 'next';
import { headers } from 'next/headers';

import { appUrl } from '@/utils/app/config';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const title = 'Terms of Service | NearBlocks';

  const description =
    'Please read these terms of service carefully. By accessing or using our services, you agree to be bound by these terms of service and all terms incorporated by reference.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    title,
  )}`;
  return {
    alternates: {
      canonical: `${appUrl}/about`,
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

export default async function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return [children];
}
