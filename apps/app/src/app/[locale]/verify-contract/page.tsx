import { Metadata } from 'next';
import { headers } from 'next/headers';

import { appUrl, networkId } from '@/utils/app/config';
import { getRpcProviders } from '@/utils/app/rpc';
import { RpcContextProvider } from '@/components/app/common/RpcContext';
import VerifierErrorBoundary from '@/components/app/Address/Contract/VerifierErrorBoundary';
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

  return (
    <>
      <div className="h-80"></div>
      <div className="container-xxl mx-auto px-5 md:px-14 flex flex-col items-center mt-[-300px]">
        <div className="w-full items-center mt-4 space-y-6">
          <RpcContextProvider rpcProviders={rpcProviders}>
            <VerifierErrorBoundary>
              <div className="w-full max-w-3xl mx-auto">
                <Verifier
                  accountId={accountId}
                  network={networkId}
                  selectedVerifier={selectedVerifier}
                />
              </div>
            </VerifierErrorBoundary>
          </RpcContextProvider>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
}
