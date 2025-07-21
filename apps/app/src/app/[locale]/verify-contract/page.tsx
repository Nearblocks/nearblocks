import { Metadata } from 'next';
import { headers } from 'next/headers';

import Verifier from '@/components/app/Address/Contract/Verifier';
import { appUrl, networkId } from '@/utils/app/config';
import { getRequest } from '@/utils/app/api';
import { getRpcProviders } from '@/utils/app/rpc';
import { RpcContextProvider } from '@/components/app/common/RpcContext';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const baseUrl = `https://${host}/`;
  const metaTitle = `${
    networkId === 'testnet' ? 'TESTNET ' : ''
  }Verify Contract | Nearblocks`;
  const metaDescription = 'Verify a smart contract on the blockchain.';

  const ogImageUrl = `${baseUrl}api/og?basic=true&title=${encodeURIComponent(
    metaTitle,
  )}`;

  return {
    alternates: {
      canonical: `${appUrl}/verify-contract`,
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
    title: `${networkId === 'testnet' ? 'TESTNET' : ''} ${metaTitle}`,
  };
}

export default async function VerifyContract(props: {
  searchParams: Promise<{ accountId: string; selectedVerifier: string }>;
}) {
  const searchParams = await props.searchParams;
  const rpcProviders = await getRpcProviders();

  const options: RequestInit = {
    cache: 'no-store',
  };

  const { accountId, selectedVerifier } = searchParams;
  const contractPromise = getRequest(
    `v1/account/${accountId}/contract`,
    {},
    options,
  );

  return (
    <>
      <div className="h-80"></div>
      <div className="container-xxl mx-auto px-5 md:px-14 flex flex-col items-center mt-[-300px]">
        <div className="md:flex items-center justify-center container-xxl mx-auto px-5">
          <h1 className="text-lg text-nearblue-600 dark:text-neargray-10 px-2 py-2 w-full text-center font-medium">
            Verify & Publish Contract Source Code
          </h1>
        </div>
        <div className="w-full max-w-3xl items-center mt-4 space-y-6">
          <RpcContextProvider rpcProviders={rpcProviders}>
            <Verifier
              accountId={accountId}
              network={networkId}
              selectedVerifier={selectedVerifier}
              contractPromise={contractPromise}
            />
          </RpcContextProvider>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
