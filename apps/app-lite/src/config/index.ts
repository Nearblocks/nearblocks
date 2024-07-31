import { env } from 'next-runtime-env';

const config = {
  account: env('NEXT_PUBLIC_ACCOUNT_ID'),
  loaderUrl: 'http://127.0.0.1:8080/api/loader',
  mainnetUrl: env('NEXT_PUBLIC_MAINNET_URL'),
  network: env('NEXT_PUBLIC_NETWORK_ID'),
  testnetUrl: env('NEXT_PUBLIC_TESTNET_URL'),
};

export default config;
