import { useEnvContext } from 'next-runtime-env';

import { Network, NetworkId } from '@/utils/types';

interface VerifierConfig {
  accountId: string;
  fileStructureApiUrl: (cid: string) => string;
  sourceCodeApiUrl: (cid: string, fileName: string) => string;
  verifierApiUrl: string;
}

export const useConfig = () => {
  const {
    API_ACCESS_KEY,
    NEXT_PUBLIC_BOS_NETWORK,
    NEXT_PUBLIC_MAINNET_URL,
    NEXT_PUBLIC_NETWORK_ID,
    NEXT_PUBLIC_TESTNET_URL,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_USER_API_URL,
  } = useEnvContext();

  const networkId: NetworkId =
    (NEXT_PUBLIC_NETWORK_ID as NetworkId) || 'testnet';
  const bosNetworkId: NetworkId =
    (NEXT_PUBLIC_BOS_NETWORK as NetworkId) || 'testnet';

  const networks: Record<NetworkId, Network> = {
    mainnet: { networkId: 'mainnet' },
    testnet: { networkId: 'testnet' },
  };

  const userApiURL =
    NEXT_PUBLIC_USER_API_URL || 'https://api.exploreblocks.io/api/';

  const network = networks[networkId];

  const siteKey = NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const apiUrl =
    networkId === 'mainnet'
      ? 'https://api3.nearblocks.io/v1/'
      : 'https://api3-testnet.nearblocks.io/v1/';

  const appUrl =
    networkId === 'mainnet' ? NEXT_PUBLIC_MAINNET_URL : NEXT_PUBLIC_TESTNET_URL;

  const docsUrl =
    networkId === 'mainnet'
      ? 'https://api3.nearblocks.io/api-docs'
      : 'https://api3-testnet.nearblocks.io/api-docs';

  const aurorablocksUrl =
    networkId === 'mainnet'
      ? 'https://aurora.exploreblocks.io'
      : 'https://aurora.exploreblocks.io';

  const verifierConfig: VerifierConfig[] =
    networkId === 'mainnet'
      ? [
          {
            accountId: 'v2-verifier.sourcescan.near',
            fileStructureApiUrl: (cid) =>
              `https://api.sourcescan.dev/api/ipfs/structure?cid=${cid}&path=src`,
            sourceCodeApiUrl: (cid, fileName) =>
              `https://api.sourcescan.dev/ipfs/${cid}/src/${fileName}`,
            verifierApiUrl: 'https://api-v2.sourcescan.dev/api/verify/rust',
          },
        ]
      : [
          {
            accountId: 'v2-verifier.sourcescan.testnet',
            fileStructureApiUrl: (cid) =>
              `https://api.sourcescan.dev/api/ipfs/structure?cid=${cid}&path=src`,
            sourceCodeApiUrl: (cid, fileName) =>
              `https://api.sourcescan.dev/ipfs/${cid}/src/${fileName}`,
            verifierApiUrl: 'https://api-v2.sourcescan.dev/api/verify/rust',
          },
        ];

  const apiAccessKey = API_ACCESS_KEY;

  return {
    apiAccessKey,
    apiUrl,
    appUrl,
    aurorablocksUrl,
    bosNetworkId,
    docsUrl,
    network,
    networkId,
    siteKey,
    userApiURL,
    verifierConfig,
  };
};
