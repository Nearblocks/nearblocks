import { Network, NetworkId } from '../types';

export const networks: Record<NetworkId, Network> = {
  mainnet: {
    networkId: 'mainnet',
  },
  testnet: {
    networkId: 'testnet',
  },
};

export const networkId: NetworkId =
  (process.env.NEXT_PUBLIC_NETWORK_ID as NetworkId) || 'testnet';
export const bosNetworkId: NetworkId =
  (process.env.NEXT_PUBLIC_BOS_NETWORK as NetworkId) || 'testnet';

export const network = networks[networkId];

export const apiUrl: string =
  networkId === 'mainnet'
    ? 'https://api3.nearblocks.io/v1/'
    : 'https://api3-testnet.nearblocks.io/v1/';

export const appUrl =
  process.env.NEXT_PUBLIC_NETWORK_ID === 'mainnet'
    ? process.env.NEXT_PUBLIC_MAINNET_URL
    : process.env.NEXT_PUBLIC_TESTNET_URL;

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
          verifierApiUrl: 'https://api-v2.sourcescan.dev/api/verify/rust',
        },
      ]
    : [
        {
          accountId: 'v2-verifier.sourcescan.testnet',
          fileStructureApiUrl: (cid: string) =>
            `https://api.sourcescan.dev/api/ipfs/structure?cid=${cid}&path=src`,
          sourceCodeApiUrl: (cid: string, fileName: string) =>
            `https://api.sourcescan.dev/ipfs/${cid}/src/${fileName}`,
          verifierApiUrl: 'https://api-v2.sourcescan.dev/api/verify/rust',
        },
      ];

export const chainAbstractionExplorerUrl =
  networkId === 'mainnet'
    ? {
        bitcoin: {
          address: (address: string) =>
            `https://blockchain.com/explorer/addresses/btc/${address}`,
        },
        ethereum: {
          address: (address: string) =>
            `https://etherscan.io/address/${address}`,
        },
      }
    : {
        bitcoin: {
          address: (address: string) =>
            `https://blockexplorer.one/bitcoin/testnet/address/${address}`,
        },
        ethereum: {
          address: (address: string) =>
            `https://sepolia.etherscan.io/address/${address}`,
        },
      };

const evmWalletChains = {
  mainnet: {
    chainId: 397,
    explorer: 'https://nearblocks.io',
    name: 'Near Mainnet',
    rpc: 'https://eth-rpc.mainnet.near.org',
  },
  testnet: {
    chainId: 398,
    explorer: 'https://testnet.nearblocks.io',
    name: 'Near Testnet',
    rpc: 'https://eth-rpc.testnet.near.org',
  },
};

export const EVMWalletChain = evmWalletChains[networkId];
