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
  process.env.API_URL ||
  (networkId === 'mainnet'
    ? 'https://api.nearblocks.io/v1/'
    : 'https://api-testnet.nearblocks.io/v1/');

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
          fileStructureApiUrl: (cid: string, path: string = '') =>
            `https://api.sourcescan.dev/api/ipfs/structure?cid=${cid}&path=${path}`,
          sourceCodeApiUrl: (cid: string, filePath: string) =>
            `https://api.sourcescan.dev/ipfs/${cid}/${filePath}`,
          ipfsUrl: (cid: string) => `https://api.sourcescan.dev/ipfs/${cid}`,
          verifierApiUrl: 'https://api-v2.sourcescan.dev/api/verify/rust',
        },
      ]
    : [
        {
          accountId: 'v2-verifier.sourcescan.testnet',
          fileStructureApiUrl: (cid: string, path: string = '') =>
            `https://api.sourcescan.dev/api/ipfs/structure?cid=${cid}&path=${path}`,
          sourceCodeApiUrl: (cid: string, filePath: string) =>
            `https://api.sourcescan.dev/ipfs/${cid}/${filePath}`,
          ipfsUrl: (cid: string) => `https://api.sourcescan.dev/ipfs/${cid}`,
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

export const chain = {
  bitcoin: 'BITCOIN',
  ethereum: 'ETHEREUM',
};

const evmWalletChains = {
  mainnet: {
    caipNetworkId: '397',
    chainId: 397,
    explorer: 'https://nearblocks.io',
    name: 'Near Mainnet',
    rpc: 'https://eth-rpc.mainnet.near.org',
  },
  testnet: {
    caipNetworkId: '398',
    chainId: 398,
    explorer: 'https://testnet.nearblocks.io',
    name: 'Near Testnet',
    rpc: 'https://eth-rpc.testnet.near.org',
  },
};

export const EVMWalletChain = evmWalletChains[networkId];

export const userApiURL =
  process.env.NEXT_PUBLIC_USER_API_URL || 'https://api.exploreblocks.io/api/';

export const userAuthURL =
  process.env.NEXT_PUBLIC_USER_AUTH_URL || 'https://api.exploreblocks.io/api/';

export const GTMID = process.env.NEXT_PUBLIC_GTM_ID || 'G-XKTTC0Q819';
