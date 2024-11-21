export const runtime = 'edge';

import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import ThemeImage from '@/components/app/Advertise/ThemeImage';
import { Link } from '@/i18n/routing';
import { appUrl } from '@/utils/app/config';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });

  const title = `Advertise on nearblocks.io | Nearblocks`;

  const description = t('homePage.metaDescription');

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    title,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/advertise`,
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

export default async function Advertise(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale });
  return (
    <div className="container-xxl mx-auto herobg flex flex-col items-center p-4.5 lg:!py-16 px-6">
      <div className="w-full flex ">
        <div className="md:w-3/6 w-full flex flex-col items-start">
          <p className="text-green-500 text-sm lg:!text-base font-semibold lg:!mt-3 mt-5 dark:text-white">
            {t('ADVERTISE ON NEARBLOCKS')}
          </p>
          <h1 className="text-green-500 text-lg lg:!text-2xl font-medium mt-3 dark:text-white">
            {t('Reach millions of Blockchain')}
          </h1>
          <h1 className="text-green-500 text-lg lg:!text-2xl font-medium dark:text-white">
            {t('Enthusiasts and Developers Worldwide')}
          </h1>
          <h3 className="text-neargray-600 md:w-3/4 w-full text-sm lg:!text-sm font-normal mt-3 dark:text-white text-justify">
            {t(
              'Nearblocks is the leading Block Explorer, Search, API and Analytics Platform for the NEAR Blockchain.',
            )}
          </h3>
          <h3 className="text-neargray-600 md:w-3/4 w-full text-justify text-sm lg:!text-sm font-normal mt-3 dark:text-white break-words">
            {t(
              'Our website offers wide exposure to the Near Protocol and block chain community. Advertising with us makes it easier for users to discover your project through sponserd content on our web pages.',
            )}
          </h3>
          <Link
            className="text-base lg:!text-lg text-white font-normal px-4 py-2 bg-green-500 hover:bg-green-400  border border-green-900/10 rounded mt-6"
            href="https://dash.nearblocks.io/login"
          >
            {t('Get started now')}
          </Link>
        </div>
        <div className="md:w-3/6 w-full justify-start md:block hidden">
          <ThemeImage />
        </div>
      </div>
      <div className="sm:w-[90%] flex flex-col lg:flex-row text-center lg:border mt-4 lg:!mt-16 py-4 text-neargray-600 dark:text-neargray-10">
        <div className="w-full flex flex-row">
          <div className="w-full lg:w-1/2 p-4 flex flex-col items-center">
            <div className="flex flex-col sm:items-end w-fit justify-center">
              <div className="text-2xl font-semibold px-1">#1</div>
              <span className="text-sm pt-1">NEAR Block Explorer</span>
            </div>
          </div>
          <div className="w-full lg:w-1/2 p-4 border-l flex flex-col items-center">
            <div className="flex flex-col sm:items-end w-fit justify-center">
              <div className="text-2xl font-semibold px-1">3M</div>
              <span className="text-sm pt-1">Page Views Per Month</span>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-row">
          <div className="w-full lg:w-1/2 p-4 border-t-[1px] lg:border-l lg:border-t-0 flex flex-col items-center">
            <div className="flex flex-col sm:items-end w-fit justify-center">
              <div className="text-2xl font-semibold px-1">900K</div>
              <span className="text-sm pt-1">Unique Visitors per Month</span>
            </div>
          </div>
          <div className="w-full lg:w-1/2 p-4 border-t-[1px] lg:border-t-0 border-l flex flex-col items-center">
            <div className="flex flex-col sm:items-end w-fit justify-center">
              <div className="text-2xl font-semibold px-1">150K</div>
              <span className="text-sm pt-1">Registered Users</span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-neargray-600 pt-12 pb-16 px-6 sm:w-[90%] soft-shadow divide-y dark:divide-black-200 rounded-lg bg-white dark:bg-black-600 dark:text-neargray-10 mt-8">
        <div className="pb-3 text-center">
          <h2 className="text-base lg:!text-2xl font-medium dark:text-green-250 text-green-500">
            {t('Advertisement Types')}
          </h2>
          <div className="py-8">
            {t(
              `Get your message in front of millions blockchain enthusiasts. Our sponsored contents are designed`,
            )}
            <span className="block lg:!block">
              {' '}
              {t(`to be cohesive with the site's user experience.`)}
            </span>
          </div>
        </div>
        <div>
          <div className="mt-8 grid lg:!grid-cols-9 grid-cols-1 lg:!gap-8">
            <div className="col-span-1 lg:!col-span-5 text-neargray-600 dark:text-neargray-10">
              <h3 className="font-semibold text-base lg:!text-lg text-green-500 dark:text-green-250">
                {t('Banner Ad Sponsorship')}
              </h3>
              <p className="text-xs lg:!text-base mt-3">
                {t(
                  `Prominently create brand awareness and user retention with banner ads on Nearblocks pages. Creatively promote, engage user and increase "eyeball" reach.`,
                )}
              </p>
              <div className="mt-5 font-normal gap-3 flex flex-col text-xs lg:!text-base">
                <div className="flex items-center">
                  {
                    // eslint-disable-next-line
                    <img
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                      src="/images/icon-check.svg"
                    />
                  }
                  <span className="ml-2">{t('Graphical')}</span>
                </div>
                <div className="flex items-center">
                  {
                    // eslint-disable-next-line
                    <img
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                      src="/images/icon-check.svg"
                    />
                  }
                  <span className="ml-2">{t('Eyeball Catching')}</span>
                </div>
                <div className="flex items-center">
                  {
                    // eslint-disable-next-line
                    <img
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                      src="/images/icon-check.svg"
                    />
                  }
                  <span className="ml-2">{t('Brand Awareness')}</span>
                </div>
              </div>
            </div>
            <div className="col-span-1 lg:!col-span-4">
              {
                // eslint-disable-next-line
                <img
                  alt="NearBlocks"
                  className="w-full"
                  src="/images/banner-ads-near.svg"
                  width="100%"
                />
              }
            </div>
          </div>
          <div className="mt-8 grid lg:!grid-cols-9 grid-cols-1 lg:!gap-8">
            <div className="col-span-1 lg:!col-span-5 text-neargray-600 dark:text-neargray-10">
              <h3 className="font-semibold text-base lg:!text-lg text-green-500 dark:text-green-250">
                {t('Header Text Ad Sponsorship')}
              </h3>
              <p className="text-xs lg:!text-base mt-3">
                {t(
                  `Reach users by reaching to them individually with targeted copy. Your sponsored ad 
                text displays in a non-intrusive and clean manner on the top of Nearblocks pages.`,
                )}
              </p>
              <div className="mt-5 font-normal gap-3 flex flex-col text-xs lg:!text-base">
                <div className="flex items-center">
                  {
                    // eslint-disable-next-line
                    <img
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                      src="/images/icon-check.svg"
                    />
                  }
                  <span className="ml-2">{t('Clear Message')}</span>
                </div>
                <div className="flex items-center">
                  {
                    // eslint-disable-next-line
                    <img
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                      src="/images/icon-check.svg"
                    />
                  }
                  <span className="ml-2">{t('Non-Intrusive')}</span>
                </div>
                <div className="flex items-center">
                  {
                    // eslint-disable-next-line
                    <img
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                      src="/images/icon-check.svg"
                    />
                  }
                  <span className="ml-2">{t('High Coverage')}</span>
                </div>
              </div>
            </div>
            <div className="col-span-1 lg:!col-span-4">
              {
                // eslint-disable-next-line
                <img
                  alt="NearBlocks"
                  className="w-full"
                  src="/images/text-ads-near.svg"
                  width="100%"
                />
              }
            </div>
          </div>
          <div className="mt-8 grid lg:!grid-cols-9 grid-cols-1 lg:!gap-8">
            <div className="col-span-1 lg:!col-span-5 text-neargray-600 dark:text-neargray-10">
              <h3 className="font-semibold text-base lg:!text-lg text-green-500 dark:text-green-250">
                {t('Search Ad Sponsorship')}
              </h3>
              <p className="text-xs lg:!text-base mt-3">
                {t(
                  `Increase brand awareness and user retention with ads on the Search Bar. Promote creatively, engage users and increase "eyeball" reach.`,
                )}
              </p>
              <div className="mt-5 font-normal gap-3 flex flex-col text-xs lg:!text-base">
                <div className="flex items-center">
                  {
                    // eslint-disable-next-line
                    <img
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                      src="/images/icon-check.svg"
                    />
                  }
                  <span className="ml-2">{t('Clear Message')}</span>
                </div>
                <div className="flex items-center">
                  {
                    // eslint-disable-next-line
                    <img
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                      src="/images/icon-check.svg"
                    />
                  }
                  <span className="ml-2">{t('Non-Intrusive')}</span>
                </div>
                <div className="flex items-center">
                  {
                    // eslint-disable-next-line
                    <img
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                      src="/images/icon-check.svg"
                    />
                  }
                  <span className="ml-2">{t('High Coverage')}</span>
                </div>
              </div>
            </div>
            <div className="col-span-1 lg:!col-span-4">
              {
                // eslint-disable-next-line
                <img
                  alt="NearBlocks"
                  className="w-full"
                  src="/images/search-ads-near.svg"
                  width="100%"
                />
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
