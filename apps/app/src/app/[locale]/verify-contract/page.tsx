import { Metadata } from 'next';
import { headers } from 'next/headers';

import { appUrl, networkId } from '@/utils/app/config';
import { getRpcProviders } from '@/utils/app/rpc';
import { RpcContextProvider } from '@/components/app/common/RpcContext';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorMessage from '@/components/app/common/ErrorMessage';
import FaInbox from '@/components/app/Icons/FaInbox';
import Verifier from '@/components/app/Address/Contract/Verifier';

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

  const { accountId, selectedVerifier } = searchParams;

  const errorBoundaryFallback = (
    <div className="h-96 flex items-center justify-center bg-white rounded-lg">
      <ErrorMessage
        icons={<FaInbox />}
        message={
          'An error occurred while loading the contract verification form.'
        }
        mutedText="Please try again later"
        reset
      />
    </div>
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
            <ErrorBoundary fallback={errorBoundaryFallback}>
              <Verifier
                accountId={accountId}
                network={networkId}
                selectedVerifier={selectedVerifier}
              />
            </ErrorBoundary>
          </RpcContextProvider>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
