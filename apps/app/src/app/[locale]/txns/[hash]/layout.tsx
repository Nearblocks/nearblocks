import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

import FaCheckCircle from '@/components/app/Icons/FaCheckCircle';
import ListCheck from '@/components/app/Icons/ListCheck';
import RpcMenu from '@/components/app/Layouts/RpcMenu';
/* import SponserdText from '@/components/app/SponserdText'; */
import { networkId } from '@/utils/app/config';
import { appUrl } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ hash: string; locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;

  const { hash } = params;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const t = await getTranslations({ locale });

  const metaTitle = t('txnDetails.metaTitle', { txn: hash });
  const metaDescription = t('txnDetails.metaDescription', { txn: hash });

  const ogImageUrl = `${baseUrl}api/og?transaction=true&transaction_hash=${hash}&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/txns/${hash}`,
    },
    description: metaDescription,
    openGraph: {
      description: metaDescription,
      images: [
        {
          alt: metaTitle,
          height: 405,
          url: ogImageUrl.toString(),
          width: 720,
        },
      ],
      title: metaTitle,
    },
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function TxnsLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const params = await props.params;

  const { hash, locale } = params;

  const { children } = props;

  const t = await getTranslations({ locale });

  return (
    <>
      <div className="md:flex items-center justify-between container-xxl mx-auto px-5">
        <div className="flex justify-between dark:text-neargray-10 border-b w-full dark:border-black-200">
          <h1 className="py-4 space-x-2 text-lg leading-8 font-bold dark:text-neargray-10 text-nearblue-600">
            {t ? t('txnDetails.heading') : 'Transaction Details'}
          </h1>

          <ul className="flex relative md:pt-0 pt-2 items-center text-gray-500 text-xs">
            <RpcMenu />
            <li className="ml-3 max-md:mb-2">
              <span className="group flex w-full relative h-full">
                <a
                  className={`md:flex justify-center w-full hover:text-green-500 dark:hover:text-green-250 hover:no-underline px-0 py-1`}
                  href="#"
                >
                  <div className="py-2 px-2 h-8 bg-gray-100 dark:bg-black-200 rounded border">
                    <ListCheck className="h-4 dark:filter dark:invert" />
                  </div>
                </a>
                <ul className="bg-white dark:bg-black-600 soft-shadow hidden min-w-full absolute top-full right-0 rounded-md group-hover:block py-1 z-[99]">
                  <li className="pb-2">
                    <a
                      className={`flex items-center whitespace-nowrap px-2 pt-2 hover:text-green-400 dark:text-neargray-10 dark:hover:text-green-250`}
                      href={`https://lite.nearblocks.io/txns/${hash}?network=${networkId}`}
                      target="_blank"
                    >
                      Validate Transaction
                      <span className="w-4 ml-3 dark:text-green-250">
                        <FaCheckCircle />
                      </span>
                    </a>
                  </li>
                </ul>
              </span>
            </li>
          </ul>
        </div>
      </div>
      {/*  <div className="container-xxl mx-auto pt-3 pb-6 px-5 dark:text-neargray-10 text-gray-700">
        <div className="min-h-[44px] md:min-h-[25px]">
          <SponserdText />
        </div>
      </div> */}
      {children}
    </>
  );
}
