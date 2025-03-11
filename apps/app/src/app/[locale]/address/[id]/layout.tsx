import { headers } from 'next/headers';

import Buttons from '@/components/app/common/Button';
import { appUrl, networkId } from '@/utils/app/config';

import RpcMenu from '@/components/app/Layouts/RpcMenu';
import ActionMenuPopover from '@/components/app/common/ActionMenuPopover';
import FaDoubleCheck from '@/components/app/Icons/FaDoubleCheck';

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
          <div className="flex md:flex-wrap w-full border-b dark:border-black-200">
            <div className="md:flex md:flex-wrap py-3 justify-between md:items-center dark:text-neargray-10 w-full">
              <h1 className="text-lg py-2 px-1 dark:text-neargray-10 text-nearblue-600 font-medium md:inline-flex flex-wrap">
                <span className="flex">Near Account:&nbsp;</span>
                {id && (
                  <span className="text-green-500 dark:text-green-250 sm:ml-0.5 mr-0.5 flex-wrap">
                    @<span className="font-semibold">{id}</span>
                  </span>
                )}
                <span className="ml-1">
                  <Buttons address={id as string} />
                </span>
              </h1>
              <div className="flex relative items-center text-center justify-between text-gray-500 text-xs">
                <div className="items-center flex gap-2">
                  <RpcMenu />
                  <span className="group flex w-full h-full">
                    <ActionMenuPopover>
                      <ul>
                        <li className="hover:bg-gray-100 dark:hover:bg-black-200 px-2 py-1 rounded-md whitespace-nowrap text-nearblue-600 dark:text-neargray-10 dark:hover:text-green-250">
                          <span className="hover:text-green-400 dark:hover:text-green-250 flex items-center">
                            <span className="mr-2">
                              <FaDoubleCheck />
                            </span>
                            <a
                              className="text-xs"
                              href={`https://lite.nearblocks.io/address/${id}?network=${networkId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Validate Account
                            </a>
                          </span>
                        </li>
                      </ul>
                    </ActionMenuPopover>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-2">{children}</div>
      </div>
    </>
  );
}
