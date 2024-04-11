/* eslint-disable @next/next/no-img-element */
import Head from 'next/head';
import Link from 'next/link';
import { Fragment, ReactElement } from 'react';
import Layout from '@/components/Layouts';
import useTranslation from 'next-translate/useTranslation';
import { appUrl } from '@/utils/config';

const AdvertisePage = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <Head>
        <title>{t('Advertise on nearblocks.io')}</title>
        <meta name="title" content={t('Advertise on nearblocks.io')} />
        <meta name="description" content={t('home:metaDescription')} />
        <meta property="og:title" content={t('Advertise on nearblocks.io')} />
        <meta property="og:description" content={t('home:metaDescription')} />
        <meta
          property="twitter:title"
          content={t('Advertise on nearblocks.io')}
        />
        <meta
          property="twitter:description"
          content={t('home:metaDescription')}
        />
        <meta
          property="og:image"
          content="/thumbnail/thumbnail_advertise.png"
        />
        <meta
          property="twitter:image"
          content="/thumbnail/thumbnail_advertise.png"
        />
        <link rel="canonical" href={`${appUrl}/advertise`} />
      </Head>
      <div className="herobg flex flex-col items-start p-4.5 lg:!py-16 lg:!px-14">
        <p className="text-black text-sm lg:!text-base font-semibold lg:!mt-3 mt-5">
          {t('Advertise on nearblocks.io')}
        </p>
        <h1 className="text-black text-lg lg:!text-2xl font-medium mt-3">
          {t(
            'Reach a targeted Near Audience with a variety of Advertising options',
          )}
        </h1>
        <Link href="/contact" legacyBehavior>
          <a className="text-base lg:!text-lg text-white font-normal px-4 py-2 bg-green-500 hover:bg-green-400  border border-green-900/10 rounded mt-6">
            {t('Contact Us')}
          </a>
        </Link>
        <div className="text-neargray-600 pt-12 pb-16 px-6 w-full soft-shadow divide-y rounded-lg bg-white mt-8">
          <div className="pb-3">
            <h2 className="text-base lg:!text-2xl text-black font-medium">
              {t('Why nearblocks.io ?')}
            </h2>
            <div className="py-8">
              <ul className="list-disc ml-5 text-xs lg:!text-base text-neargray-600 font-normal">
                <li>
                  {t(`NearBlocks is the leading Block Explorer, Search, API and
                  Analytics Platform for the Near Protocol Blockchain.`)}
                </li>
                <li>
                  {t(`NearBlocks provides a wide reach to the Near Protocol
                  community and users at large.`)}
                </li>
                <li>
                  {t(`NearBlocks provides a platform for projects, businesses and
                  teams to reach out to potential users via sponsored content on
                  our web pages.`)}
                </li>
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-base lg:!text-2xl text-black font-medium mt-8">
              {t('Advertising formats')}
            </h2>
            <p className="mt-3 text-xs lg:!text-base text-neargray-600 font-normal">
              {t(`Get your message in front of millions blockchain enthusiasts. Our
              sponsored contents are designed to be cohesive with the site’s
              user experience.`)}
            </p>
            <div className="mt-8 grid lg:!grid-cols-9 grid-cols-1 lg:!gap-8">
              <div className="col-span-1 lg:!col-span-5 text-neargray-600">
                <h3 className="font-semibold text-base lg:!text-lg">
                  {t('Home Page Banner Ad Sponsorship')}
                </h3>
                <p className="text-xs lg:!text-base mt-3">
                  {t(
                    `Prominently create brand awareness and user retention with banner ads on Nearblocks's 
                    homepage. Creatively promote, engage user and increase "eyeball" reach.`,
                  )}
                </p>
                <div className="mt-5 font-normal gap-3 flex flex-col text-xs lg:!text-base">
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Graphical')}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Eyeball Catching')}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Brand Awareness')}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-1 lg:!col-span-4">
                <img
                  src="/images/Frame36070.svg"
                  alt="NearBlocks"
                  className="w-full"
                  width="100%"
                />
              </div>
            </div>
            <div className="mt-8 grid lg:!grid-cols-9 grid-cols-1 lg:!gap-8">
              <div className="col-span-1 lg:!col-span-5 text-neargray-600">
                <h3 className="font-semibold text-base lg:!text-lg">
                  {t('Header Text Ad Sponsorship')}
                </h3>
                <p className="text-xs lg:!text-base mt-3">
                  {t(
                    `Reach users by reaching to them individually with CPM sponsorship. Your sponsored ad 
                    text displays in a non-intrusive and clean manner on the top of Nearblocks’s pages.`,
                  )}
                </p>
                <div className="mt-5 font-normal gap-3 flex flex-col text-xs lg:!text-base">
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Clear Message')}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Non-Intrusive')}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('High Coverage')}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-1 lg:!col-span-4">
                <img
                  src="/images/Frame36071.svg"
                  alt="NearBlocks"
                  className="w-full"
                  width="100%"
                />
              </div>
            </div>
            <div className="mt-8 grid lg:!grid-cols-9 grid-cols-1 lg:!gap-8">
              <div className="col-span-1 lg:!col-span-5 text-neargray-600">
                <h3 className="font-semibold text-base lg:!text-lg ">
                  {t('Banner Ad Sponsorship')}
                </h3>
                <p className="text-xs lg:!text-base mt-3">
                  {t(
                    `Prominently create brand awareness and user retention with banner ads on
                     Nearblock's pages. Creatively promote, engage user and increase "eyeball" reach.`,
                  )}
                </p>
                <div className="mt-5 font-normal gap-3 flex flex-col text-xs lg:!text-base">
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Graphical')}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Eyeball Catching')}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Brand Awareness')}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-1 lg:!col-span-4">
                <img
                  src="/images/Frame36072.svg"
                  alt="NearBlocks"
                  className="w-full"
                  width="100%"
                />
              </div>
            </div>
            <div className="mt-8 grid lg:!grid-cols-9 grid-cols-1 lg:!gap-8">
              <div className="col-span-1 lg:!col-span-5 text-neargray-600">
                <h3 className="font-semibold text-base lg:!text-lg">
                  {t('Button Ad Sponsorship')}
                </h3>
                <p className="text-xs lg:!text-base mt-3">
                  {t(
                    `Promote your products and services readily on the pages of NearBlocks with
                     Button Sponsorship. Call To Action (CTA) button allows users to engage with 
                     you from a click of a button.`,
                  )}
                </p>
                <div className="mt-5 font-normal gap-3 flex flex-col text-xs lg:!text-base">
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Exclusive')}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Targeted')}</span>
                  </div>
                  <div className="flex items-center">
                    <img
                      src="/images/checked.svg"
                      alt="NearBlocks"
                      className="lg:!w-5.5 w-4.5"
                    />
                    <span className="ml-2">{t('Native Design')}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-1 lg:!col-span-4">
                <img
                  src="/images/Frame36073.svg"
                  alt="NearBlocks"
                  className="w-full"
                  width="100%"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

AdvertisePage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default AdvertisePage;
