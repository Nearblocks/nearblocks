import { Metadata } from 'next';

import { appUrl } from '@/utils/app/config';

export async function generateMetadata(): Promise<Metadata> {
  const title = ' Near Protocol Explorer | NearBlocks';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    title,
  )}`;
  return {
    alternates: {
      canonical: `${appUrl}/exportdata`,
    },
    openGraph: {
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

export default async function ExportDataLayout({
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return [children];
}
