import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

import ContactOptions from '@/components/app/Contact/ContactOptions';
import { appUrl } from '@/utils/app/config';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;

  const title = t('contact.metaTitle');

  const description = t('contact.metaDescription');

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

export default async function Contact(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });

  return (
    <>
      <div className="h-72"></div>
      <div className="container-xxl mx-auto px-5 md:px-14 flex flex-col items-start py-16 mt-[-350px]">
        <h1 className="mb-4 pt-8 sm:!text-2xl text-xl dark:text-white">
          {`Contact NearBlocks`}
        </h1>
        <div className="text-neargray-600 dark:text-neargray-10 pt-4 pb-8 gap-6 w-full soft-shadow rounded-lg bg-white dark:bg-black-600 lg:mt-8 mt-4">
          <p className="text-lg px-10 text-neargray-600 dark:text-neargray-10 pb-4 font-medium sm:mt-0 mt-8 mb-4 border-b dark:border-slate-800">
            {t(`contact.form.heading`)}
          </p>
          <div className="flex flex-col mx-auto px-10 ">
            <div className="col-span-5 text-green dark:text-neargreen-200 soft-shadow bg-nearblue dark:bg-gray-950 border rounded-lg p-4">
              <p className="text-sm font-bold">{t(`contact.info.heading`)}</p>
              <div className="my-4 flex flex-col gap-4">
                {[
                  {
                    description: `We do not process transactions and are therefore unable to expedite, cancel or replace them.`,
                    id: Math.random(),
                    title: 'Pending Transaction',
                  },
                  {
                    description: `NearBlocks is an independent block explorer unrelated to other service providers (unless stated explicitly otherwise) and is therefore unable to provide a precise response for inquiries that are specific to other service providers.`,
                    id: Math.random(),
                    title: 'Near Protocol Block Explorer',
                  },
                  {
                    description: `Kindly reach out to your wallet service provider, exchanges or project/contract owner for further support as they are in a better position to assist you on the issues related to and from their platforms.`,
                    id: Math.random(),
                    title: 'Wallet / Exchange / Project related issues ',
                  },
                ].map((item, index) => (
                  <div key={item.id}>
                    <div className="flex ml-5 text-sm ">
                      {index + 1}.
                      <div className="ml-1">
                        <p className="font-bold text-sm">{item.title}</p>
                        <p className="text-sm mt-1">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <ContactOptions />
          </div>
        </div>
      </div>{' '}
    </>
  );
}
