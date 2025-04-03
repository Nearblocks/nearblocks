import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import RpcMenu from '@/components/app/Layouts/RpcMenu';
import { appUrl, networkId } from '@/utils/app/config';
import ActionMenuPopover from '@/components/app/common/ActionMenuPopover';
import FaCheckCircle from '@/components/app/Icons/FaCheckCircle';

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
  params: Promise<{ hash: string; locale: string }>;
}) {
  const params = await props.params;

  const { hash, locale } = params;

  const { children } = props;

  const t = await getTranslations({ locale });

  return (
    <>
      <div className="md:flex items-center justify-between container-xxl mx-auto px-5">
        <div className="flex justify-between dark:text-neargray-10 border-b w-full dark:border-black-200">
          <h1 className="py-4 space-x-2 text-lg leading-8 font-medium dark:text-neargray-10 text-nearblue-600">
            {t ? t('txnDetails.heading') : 'Transaction Details'}
          </h1>
          <ul className="flex relative md:pt-0 pt-2 items-center text-gray-500 text-xs gap-x-2">
            <RpcMenu positionClass="right-0" />
            <ActionMenuPopover positionClass="right-0">
              <li className=" hover:bg-gray-100 dark:hover:bg-black-200 rounded-md whitespace-nowrap text-nearblue-600 dark:text-neargray-10 dark:hover:text-green-250 p-1 pl-2 flex h-full w-full">
                <span className="hover:text-green-400 dark:hover:text-green-250 flex items-center text-xs">
                  <a
                    className={`inline-flex items-center whitespace-nowrap hover:text-green-400 dark:text-neargray-10 dark:hover:text-green-250`}
                    href={`https://nearvalidate.org/txns/${hash}?network=${networkId}`}
                    target="_blank"
                  >
                    Validate Transaction
                    <span className="w-4 ml-3 dark:text-green-250 inline-flex">
                      <FaCheckCircle />
                    </span>
                  </a>
                </span>
              </li>
            </ActionMenuPopover>
          </ul>
        </div>
      </div>
      {children}
    </>
  );
}
