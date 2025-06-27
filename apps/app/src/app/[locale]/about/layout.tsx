import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

import { appUrl } from '@/utils/app/config';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const { locale } = params;

  const t = await getTranslations({ locale });

  const title = t('aboutNear.metaTitle');

  const description = t('aboutNear.metaDescription');

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

export default async function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="h-72 -mb-48"></div>
      <div className="py-16 bg-white dark:bg-black-600 soft-shadow container-xxl sm:mx-auto rounded-md mb-10">
        {children}
      </div>
    </>
  );
}
