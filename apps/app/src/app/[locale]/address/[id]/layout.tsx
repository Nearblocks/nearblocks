import { headers } from 'next/headers';

import Buttons from '@/components/app/common/Button';
import FaCheckCircle from '@/components/app/Icons/FaCheckCircle';
import ListCheck from '@/components/app/Icons/ListCheck';
import RpcMenu from '@/components/app/Layouts/RpcMenu';
/* import SponserdText from '@/components/app/SponserdText'; */
import { appUrl, networkId } from '@/utils/app/config';

const network = process.env.NEXT_PUBLIC_NETWORK_ID;

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const { id } = params;

  const thumbnail = `${baseUrl}api/og?account=true&address=${id}`;
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

export default async function AddressLayout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;

  const { id } = params;

  const { children } = props;

  return (
    <>
      <div className="relative container-xxl mx-auto px-4">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex md:flex-wrap w-full border-b mb-5 dark:border-black-200">
            <div className="sm:flex flex-1 py-2 justify-between md:items-center dark:text-neargray-10 w-full ">
              <h1 className="break-all text-lg py-2 px-1 dark:text-neargray-10 text-nearblue-600 font-bold">
                Near Account:&nbsp;
                {id && (
                  <span className="text-green-500 dark:text-green-250 mx-0.5">
                    @<span className="font-semibold">{id}</span>
                  </span>
                )}
                <span className="ml-1">
                  <Buttons address={id as string} />
                </span>
              </h1>
              <div>
                <ul className="flex relative md:pt-2 sm:pb-2 items-center text-gray-500 text-xs">
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
          {/*  <div className="container-xxl justify-left pl-2 pb-6 dark:text-neargray-10 text-gray-700">
            <div className="min-h-[80px] md:min-h-[25px]">
              <SponserdText />
            </div>
          </div> */}
        </div>
        {children}
      </div>
    </>
  );
}
