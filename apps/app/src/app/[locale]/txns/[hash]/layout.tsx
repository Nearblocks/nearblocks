import FaCheckCircle from '@/components/app/Icons/FaCheckCircle';
import SponserdText from '@/components/app/SponserdText';
import ListCheck from '@/components/Icons/ListCheck';
import { networkId } from '@/utils/app/config';
import { getTranslations } from 'next-intl/server';
import dynamic from 'next/dynamic';
import { appUrl } from '@/utils/app/config';
import { Metadata } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata({
  params: { locale, hash },
}: {
  params: { hash: string; locale: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);

  const metaTitle = 'All Latest Near Protocol Transactions | NearBlocks';
  const metaDescription =
    'All Latest Near Protocol transactions confirmed on Near Blockchain. The list consists of transactions from sending Near and the transactions details for each transaction.';

  const ogImageUrl = `${appUrl}/api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    title: `${network === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 720,
          height: 405,
          alt: metaTitle,
        },
      ],
    },
    alternates: {
      canonical: `${appUrl}/txns/${hash}`,
    },
  };
}

export default async function TxnsLayout({
  params: { hash, locale },
  children,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const t = await getTranslations({ locale });
  const RpcMenu = dynamic(
    () => import('../../../../components/app/Layouts/RpcMenu'),
    {
      ssr: false,
    },
  );
  return (
    <>
      <div className="md:flex items-center justify-between container mx-auto px-3">
        <div className="flex justify-between dark:text-neargray-10 border-b w-full px-2 pt-3 dark:border-black-200">
          <h1 className="py-2 space-x-2 text-xl leading-8 text-nearblue-600">
            {t ? t('txn.heading') : 'Transaction Details'}
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
      <div className="container mx-auto pt-3 pb-6 px-5 text-nearblue-600">
        <div className="min-h-[44px] md:min-h-[25px]">
          <SponserdText />
        </div>
      </div>
      {children}
    </>
  );
}
