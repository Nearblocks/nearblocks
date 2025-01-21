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

export const network = networks[networkId];

export const apiUrl: string =
  networkId === 'mainnet'
    ? 'https://api.nearblocks.io/v1/'
    : 'https://api-testnet.nearblocks.io/v1/';

export const appUrl =
  env('NEXT_PUBLIC_NETWORK_ID') === 'mainnet'
    ? env('NEXT_PUBLIC_MAINNET_URL')
    : env('NEXT_PUBLIC_TESTNET_URL');

export const docsUrl: string =
  networkId === 'mainnet'
    ? 'https://api.nearblocks.io/api-docs'
    : 'https://api-testnet.nearblocks.io/api-docs';

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
        ethereum: {
          address: (address: string) =>
            `https://etherscan.io/address/${address}`,
          transaction: (hash: string) => `https://etherscan.io/tx/${hash}`,
        },
        bitcoin: {
          address: (address: string) =>
            `https://blockchain.com/explorer/addresses/btc/${address}`,
          transaction: (hash: string) =>
            `https://www.blockchain.com/explorer/transactions/btc/${hash}`,
        },
        arbitrum: {
          address: (address: string) =>
            `https://arbiscan.io/address/${address}`,
          transaction: (hash: string) => `https://arbiscan.io/tx/${hash}`,
        },
        solana: {
          address: (address: string) =>
            `https://explorer.solana.com/address/${address}`,
          transaction: (hash: string) =>
            `https://explorer.solana.com/tx/${hash}`,
        },
        base: {
          address: (address: string) =>
            `https://basescan.org/address/${address}`,
          transaction: (hash: string) => `https://basescan.org/tx/${hash}`,
        },
        doge: {
          address: (address: string) =>
            `https://dogechain.info/address/${address}`,
          transaction: (hash: string) => `https://dogechain.info/tx/${hash}`,
        },
        xrp: {
          address: (address: string) =>
            `https://xrpscan.com/account/${address}`,
          transaction: (hash: string) => `https://xrpscan.com/tx/${hash}`,
        },
      }
    : {
        ethereum: {
          address: (address: string) =>
            `https://sepolia.etherscan.io/address/${address}`,
          transaction: (hash: string) =>
            `https://sepolia.etherscan.io/tx/${hash}`,
        },
        bitcoin: {
          address: (address: string) =>
            `https://blockexplorer.one/bitcoin/testnet/address/${address}`,
          transaction: (hash: string) => `${hash}`,
        },
        arbitrum: {
          address: (address: string) =>
            `https://sepolia.arbiscan.io/address/${address}`,
          transaction: (hash: string) => `${hash}`,
        },
        solana: {
          address: (address: string) =>
            `https://explorer.solana.com/address/${address}?cluster=testnet`,
          transaction: (hash: string) => `${hash}`,
        },
        base: {
          address: (address: string) =>
            `https://sepolia.basescan.org/address/${address}`,
          transaction: (hash: string) => `${hash}`,
        },
        doge: {
          address: (address: string) =>
            `https://basescan.org/address/${address}`,
          transaction: (hash: string) => `https://dogechain.info/tx/${hash}`,
        },
        xrp: {
          address: (address: string) =>
            `https://xrpscan.com/account/${address}`,
          transaction: (hash: string) => `https://xrpscan.com/tx/${hash}`,
        },
      };

export const EVMWalletChain = evmWalletChains[networkId];

export const intentsAddressList: Record<string, string> = {
  'eth-0xdac17f958d2ee523a2206206994597c13d831ec7':
    'eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near',
  eth: 'eth.omft.near',
  'base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913':
    'base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near',
  'eth-0x6982508145454ce325ddbe47a25d4ec3d2311933':
    'eth-0x6982508145454ce325ddbe47a25d4ec3d2311933.omft.near',
  'eth-0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9':
    'eth-0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.omft.near',
  'eth-0xaaee1a9723aadb7afa2810263653a34ba2c21c7a':
    'eth-0xaaee1a9723aadb7afa2810263653a34ba2c21c7a.omft.near',
  'eth-0x514910771af9ca656af840dff83e8264ecf986ca':
    'eth-0x514910771af9ca656af840dff83e8264ecf986ca.omft.near',
  'arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831':
    'arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near',
  base: 'base.omft.near',
  'eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48':
    'eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near',
  'eth-0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce':
    'eth-0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce.omft.near',
  'eth-0x1f9840a85d5af5bf1d1762f925bdaddc4201f984':
    'eth-0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.omft.near',
  doge: 'doge.omft.near',
  'arb-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9':
    'arb-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9.omft.near',
  'eth-0xaaaaaa20d9e0e2461697782ef11675f668207961':
    'eth-0xaaaaaa20d9e0e2461697782ef11675f668207961.omft.near',
  'arb-0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a':
    'arb-0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a.omft.near',
  'sol-5ce3bf3a31af18be40ba30f721101b4341690186':
    'sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near',
  'base-0x532f27101965dd16442e59d40670faf5ebb142e4':
    'base-0x532f27101965dd16442e59d40670faf5ebb142e4.omft.near',
  'arb-0x912ce59144191c1204e64559fe8253a0e49e6548':
    'arb-0x912ce59144191c1204e64559fe8253a0e49e6548.omft.near',
  sol: 'sol.omft.near',
  'eth-0xa35923162c49cf95e6bf26623385eb431ad920d3':
    'eth-0xa35923162c49cf95e6bf26623385eb431ad920d3.omft.near',
  xrp: 'xrp.omft.near',
  btc: 'btc.omft.near',
  arb: 'arb.omft.near',
};

export const supportedNetworks = {
  eth: 'ethereum',
  arb: 'arbitrum',
  sol: 'solana',
  base: 'base',
  btc: 'bitcoin',
  doge: 'doge',
  xrp: 'xrp',
} as const;
