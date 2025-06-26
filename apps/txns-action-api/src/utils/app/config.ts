import { Network, NetworkId } from 'src/types/types';

export const networks: Record<NetworkId, Network> = {
  mainnet: {
    networkId: 'mainnet',
  },
  testnet: {
    networkId: 'testnet',
  },
};

export const networkId: NetworkId =
  (process.env.NETWORK as NetworkId) || 'testnet';

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

export type ParsedLog = {
  txHash: string;
  networkType: string;
};
