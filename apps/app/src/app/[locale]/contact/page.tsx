import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

import ContactOptions from '@/components/app/Contact/ContactOptions';
import { appUrl } from '@/utils/app/config';
import { Link } from '@/i18n/routing';

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
      <div className="container-xxl mx-auto px-5 pb-8 md:px-14 flex flex-col items-start">
        <h1 className="text-lg font-bold dark:text-neargray-10 text-nearblue-600 py-5">
          {`Contact NearBlocks`}
        </h1>
        <div className="dark:text-neargray-10 pt-4 pb-5 gap-6 w-full soft-shadow rounded-lg bg-white dark:bg-black-600">
          <p className="text-base px-5 dark:text-neargray-10 pb-4 font-semibold sm:mt-0 mt-8 mb-4 border-b dark:border-slate-800">
            {t(`contact.form.heading`)}
          </p>
          <div className="flex flex-col mx-auto px-5 ">
            <div className="col-span-5 text-green dark:text-neargreen-200 soft-shadow bg-nearblue dark:bg-gray-950 border rounded-lg p-4">
              <p className="text-sm font-bold">{t(`contact.info.heading`)}</p>
              <div className="my-4 flex flex-col gap-4">
                {[
                  {
                    id: Math.random(),
                    title: 'Refund Transaction',
                    description: ` We do not process transactions and are therefore unable to revert, refund, expedite, cancel or replace them.`,
                  },
                  {
                    id: Math.random(),
                    title: 'Near Protocol Block Explorer',
                    description: `NearBlocks is an independent block explorer unrelated to other service providers (unless stated explicitly otherwise) and is therefore unable to provide a precise response for inquiries that are specific to other service providers.`,
                  },
                  {
                    id: Math.random(),
                    title: 'Wallet / Exchange / Project related issues ',
                    description: `Kindly reach out to your wallet service provider, exchanges or project/contract owner for further support as they are in a better position to assist you on the issues related to and from their platforms.`,
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
              <p className="text-sm">
                Near community support can be found here
                <Link
                  href={`https://dev.near.org/communities`}
                  className="ml-1 font-semibold"
                >
                  https://dev.near.org/communities
                </Link>
              </p>
            </div>
            <ContactOptions />
          </div>
        </div>
      </div>{' '}
    </>
  );
}
