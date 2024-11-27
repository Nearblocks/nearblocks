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
  return (
    <>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72"></div>
      <div className="md:px-14 flex flex-col items-start md:py-16 -mt-80 mx-2">
        <h1 className="mb-2 pt-8 sm:!text-2xl text-center text-xl text-white">
          Terms of Service
        </h1>
        {children}
      </div>
    </>
  );
}
