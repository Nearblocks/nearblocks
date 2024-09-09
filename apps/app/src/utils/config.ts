import type { Network, NetworkId } from './types';
import { env } from 'next-runtime-env';

export const networks: Record<NetworkId, Network> = {
  mainnet: {
    networkId: 'mainnet',
  },
  testnet: {
    networkId: 'testnet',
  },
};

export const networkId: NetworkId =
  (env('NEXT_PUBLIC_NETWORK_ID') as NetworkId) || 'testnet';
export const bosNetworkId: NetworkId =
  (env('NEXT_PUBLIC_BOS_NETWORK') as NetworkId) || 'testnet';

export const network = networks[networkId];

export const apiUrl: string =
  networkId === 'mainnet'
    ? 'https://api3.nearblocks.io/v1/'
    : 'https://api3-testnet.nearblocks.io/v1/';

export const appUrl =
  env('NEXT_PUBLIC_NETWORK_ID') === 'mainnet'
    ? env('NEXT_PUBLIC_MAINNET_URL')
    : env('NEXT_PUBLIC_TESTNET_URL');

export const docsUrl: string =
  networkId === 'mainnet'
    ? 'https://api3.nearblocks.io/api-docs'
    : 'https://api3-testnet.nearblocks.io/api-docs';

export const aurorablocksUrl: string =
  networkId === 'mainnet'
    ? 'https://aurora.exploreblocks.io'
    : 'https://aurora.exploreblocks.io';

export const verifierConfig =
  networkId === 'mainnet'
    ? [
        {
          accountId: 'v2-verifier.sourcescan.near',
          fileStructureApiUrl: (cid: string) =>
            `https://api.sourcescan.dev/api/ipfs/structure?cid=${cid}&path=src`,
          sourceCodeApiUrl: (cid: string, fileName: string) =>
            `https://api.sourcescan.dev/ipfs/${cid}/src/${fileName}`,
        },
      ]
    : [];
