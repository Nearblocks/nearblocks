import { bool, cleanEnv, num, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL_BASE: str(),
  DATABASE_URL_CONTRACT: str(),
  DATABASE_URL_EVENTS: str(),
  FT_FINDER_BUCKET_HOURS: num({ default: 1 }),
  FT_FINDER_FROM_SCRATCH: bool({ default: false }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  RPC_AUTH_TOKENS: str({ default: '' }),
  RPC_URL: str({ default: '' }),
  RPC_URLS: str({ default: '' }),
  SENTRY_DSN: str({ default: '' }),
});

const rpcUrls = env.RPC_URLS
  ? env.RPC_URLS.split(',').map((value) => value.trim()).filter(Boolean)
  : [env.RPC_URL].filter(Boolean);
if (!rpcUrls.length) throw new Error('Set RPC_URL or RPC_URLS.');
if (new Set(rpcUrls).size !== rpcUrls.length)
  throw new Error('RPC_URLS must not contain duplicate endpoints.');
for (const endpoint of rpcUrls) {
  const parsed = new URL(endpoint);
  if (!['http:', 'https:'].includes(parsed.protocol))
    throw new Error('RPC_URLS endpoints must use HTTP or HTTPS.');
}
const rpcAuthTokens = env.RPC_AUTH_TOKENS
  ? env.RPC_AUTH_TOKENS.split(',').map((value) => value.trim())
  : rpcUrls.map(() => '');
if (rpcAuthTokens.length !== rpcUrls.length)
  throw new Error('RPC_AUTH_TOKENS must have one entry per RPC_URLS endpoint.');

const config: Config = {
  bucketHours: env.FT_FINDER_BUCKET_HOURS,
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrlBase: env.DATABASE_URL_BASE,
  dbUrlContract: env.DATABASE_URL_CONTRACT,
  dbUrlEvents: env.DATABASE_URL_EVENTS,
  fromScratch: env.FT_FINDER_FROM_SCRATCH,
  insertLimit: 2_000,
  network: env.NETWORK,
  rpcDelayMs: 100,
  rpcEndpoints: rpcUrls.map((url, index) => ({
    authToken: rpcAuthTokens[index] ?? '',
    name: `rpc-${index + 1}`,
    url,
  })),
  sentryDsn: env.SENTRY_DSN,
  verifySamples: 3,
};

export default config;
