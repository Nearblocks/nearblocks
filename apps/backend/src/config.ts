import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  COINGECKO_API_KEY: str(),
  COINMARKETCAP_API_KEY: str(),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DB_URL_BASE: str(),
  DB_URL_CONTRACTS: str(),
  DB_URL_EVENTS: str(),
  FASTNEAR_API_KEY: str({ default: '' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  RPC_AUTH_TOKENS: str({ default: '' }),
  RPC_URL: str({ default: '' }),
  RPC_URLS: str({ default: '' }),
  SENTRY_DSN: str({ default: '' }),
});

const fastNearRpcFallback = () => {
  if (!env.FASTNEAR_API_KEY) return '';

  return `https://archival-rpc.${env.NETWORK}.fastnear.com`;
};
const rpcUrls = env.RPC_URLS
  ? env.RPC_URLS.split(',')
      .map((value) => value.trim())
      .filter(Boolean)
  : [env.RPC_URL, fastNearRpcFallback()].filter(
      (value): value is string => !!value,
    );
if (!rpcUrls.length) throw new Error('Set RPC_URL or RPC_URLS.');
if (new Set(rpcUrls).size !== rpcUrls.length) {
  throw new Error('RPC_URLS must not contain duplicate endpoints.');
}
for (const endpoint of rpcUrls) {
  const url = new URL(endpoint);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('RPC_URLS endpoints must use HTTP or HTTPS.');
  }
}
const rpcAuthTokens = env.RPC_AUTH_TOKENS
  ? env.RPC_AUTH_TOKENS.split(',').map((value) => value.trim())
  : rpcUrls.map((endpoint) =>
      env.FASTNEAR_API_KEY &&
      new URL(endpoint).hostname.endsWith('fastnear.com')
        ? env.FASTNEAR_API_KEY
        : '',
    );
if (rpcAuthTokens.length !== rpcUrls.length) {
  throw new Error('RPC_AUTH_TOKENS must have one entry per RPC_URLS endpoint.');
}

const genesisHeight = env.NETWORK === Network.MAINNET ? 9820210 : 42376888;
const genesisDate =
  env.NETWORK === Network.MAINNET ? '2020-07-21' : '2021-04-01';

const config: Config = {
  cgApiKey: env.COINGECKO_API_KEY,
  cmcApiKey: env.COINMARKETCAP_API_KEY,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrlBase: env.DB_URL_BASE,
  dbUrlContracts: env.DB_URL_CONTRACTS,
  dbUrlEvents: env.DB_URL_EVENTS,
  genesisDate,
  genesisHeight,
  network: env.NETWORK,
  rpcAuthTokens,
  rpcUrl: rpcUrls[0],
  rpcUrls,
  sentryDsn: env.SENTRY_DSN,
};

export default config;
