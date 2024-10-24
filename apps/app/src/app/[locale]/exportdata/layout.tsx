import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';

const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

export async function generateMetadata(): Promise<Metadata> {
  const title = ' Near Protocol Explorer | NearBlocks';

  const ogImageUrl = `${ogUrl}/api/og?basic=true&title=${encodeURIComponent(
    title,
  )}`;
  return {
    title: title,
    openGraph: {
      title: title,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 720,
          height: 405,
          alt: title,
        },
      ],
    },
    alternates: {
      canonical: `${appUrl}/exportdata`,
    },
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
