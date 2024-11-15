import { unstable_setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';

import Buttons from '@/components/app/Icons/Button';
import SponserdText from '@/components/app/SponserdText';
import FaCheckCircle from '@/components/Icons/FaCheckCircle';
import ListCheck from '@/components/Icons/ListCheck';
import { appUrl, networkId } from '@/utils/app/config';
const network = process.env.NEXT_PUBLIC_NETWORK_ID;
export async function generateMetadata({
  params: { id, locale },
}: {
  params: { id: string; locale: string };
}) {
  unstable_setRequestLocale(locale);
  const thumbnail = `${appUrl}/api/og?account=true&address=${id}`;
  const metaTitle = `Near Account ${id} | NearBlocks`;
  const metaDescription = `Near Account ${id} page allows users to view transactions, balances, token holdings and transfers.`;
  return {
    alternates: {
      canonical: `${appUrl}/address/${id}`,
    },
    description: metaDescription,
    openGraph: {
      description: metaDescription,
      images: [thumbnail],
      title: metaTitle,
    },
    title: `${network === 'testnet' ? 'TESTNET ' : ''}${metaTitle}`,
    twitter: {
      description: metaDescription,
      images: [thumbnail],
      title: metaTitle,
    },
  };
}

export default function AddressLayout({
  children,
  params: { id },
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const RpcMenu = dynamic(
    () => import('../../../../components/app/Layouts/RpcMenu'),
    {
      ssr: false,
    },
  );
  return (
    <>
      <div className="relative container-xxl mx-auto px-5 mb-10">
        <div className="flex items-center justify-between flex-wrap pt-3">
          <div className="flex md:flex-wrap w-full border-b mb-5 dark:border-black-200">
            <div className="sm:flex flex-1 justify-between md:items-center dark:text-neargray-10 w-full ">
              <h1 className="py-2 break-all space-x-2 text-xl text-gray-700 dark:text-white leading-8 px-2 font-medium">
                Near Account:&nbsp;
                {id && (
                  <span className="text-green-500 dark:text-green-250">
                    @<span className="font-semibold">{id}</span>
                  </span>
                )}
                <Buttons address={id as string} />
              </h1>
              <div>
                <ul className="flex relative md:pt-2 sm:pb-2 pb-1 items-center text-gray-500 text-xs">
                  <span className="ml-2">
                    <RpcMenu />
                  </span>
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
            </div>
          </div>
          <div className="container-xxl justify-left pl-2 pb-6 text-nearblue-600">
            <div className="min-h-[80px] md:min-h-[25px]">
              <SponserdText />
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
}
