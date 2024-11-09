const config = {
  account: process.env.NEXT_PUBLIC_ACCOUNT_ID || 'nearblocksonbos.near',
  loaderUrl: 'http://127.0.0.1:8080/api/loader',
  mainnetUrl: process.env.NEXT_PUBLIC_MAINNET_URL || 'https://nearblocks.io',
  network: process.env.NEXT_PUBLIC_NETWORK_ID || 'mainnet',
  testnetUrl: process.env.NEXT_PUBLIC_TESTNET_URL || 'https://testnet.nearblocks.io',
};

export default config;
