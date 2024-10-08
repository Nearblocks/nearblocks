import Buttons from '@/components/app/Icons/Button';
import SponserdText from '@/components/app/SponserdText';
import FaCheckCircle from '@/components/Icons/FaCheckCircle';
import ListCheck from '@/components/Icons/ListCheck';
import { appUrl, networkId } from '@/utils/app/config';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;
const ogUrl = process.env.NEXT_PUBLIC_OG_URL;

export async function generateMetadata({
  params,
}: {
  params: { hash: string; locale: string };
}) {
  unstable_setRequestLocale(params?.locale);

  const t = await getTranslations({ locale: params.locale });

  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURIComponent(
    t('block.heading', { block: params.hash }) || 'Latest Near Protocol Blocks',
  )}&brand=near`;

  const metaTitle =
    t('block.metaTitle', { block: params.hash }) ||
    'All Near Latest Protocol Blocks | NearBlocks';
  const metaDescription =
    t('block.metaDescription', { block: params.hash }) ||
    'All Near (Ⓝ Blocks that are included in Near blockchain. The timestamp, author, gas used, gas price and included transactions are shown.';

  return {
    title: `${network === 'testnet' ? 'TESTNET ' : ''}${metaTitle}`,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [thumbnail],
    },
    twitter: {
      title: metaTitle,
      description: metaDescription,
      images: [thumbnail],
    },
    alternates: {
      canonical: `${appUrl}/blocks/${params.hash}`,
    },
  };
}

export default function HaseLayout({
  params: { id },
  children,
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  const RpcMenu = dynamic(
    () => import('../../../../components/app/Layouts/RpcMenu'),
    {
      ssr: false,
    },
  );
  return (
    <>
      <div className="relative container mx-auto px-3 mb-10">
        <div className="flex items-center justify-between flex-wrap pt-4">
          <div className="flex md:flex-wrap w-full">
            <div className="flex justify-between md:items-center dark:text-neargray-10 border-b w-full mb-5 dark:border-black-200">
              <h1 className="py-2 break-all space-x-2 text-xl text-gray-700 leading-8 px-2 ">
                Near Account:&nbsp;
                {id && (
                  <span className="text-green-500 dark:text-green-250">
                    @<span className="font-semibold">{id}</span>
                  </span>
                )}
                <Buttons address={id as string} />
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
                    <ul className="bg-white dark:bg-black-600 soft-shadow hidden min-w-full absolute top-full right-0 rounded-lg group-hover:block py-1 z-[99]">
                      <li className="pb-2">
                        <a
                          className={`flex items-center whitespace-nowrap px-2 pt-2 hover:text-green-400 dark:text-neargray-10 dark:hover:text-green-250`}
                          href={`https://validate.nearblocks.io/address/${id}?network=${networkId}`}
                          target="_blank"
                        >
                          Validate Account
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
            <div className="container mx-auto pl-2 pb-6 text-nearblue-600">
              <div className="min-h-[80px] md:min-h-[25px]">
                <SponserdText />
              </div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
}
