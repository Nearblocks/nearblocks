import log from '#libs/log';
import { Network } from '#types/enums';
import { Config } from '#types/types';

const dbUrl = process.env.DATABASE_URL;
const rpcUrl = process.env.RPC_URL;
const cmcApiKey = process.env.COINMARKETCAP_API_KEY;
const lcwApiKey = process.env.LIVECOINWATCH_API_KEY;
const coingeckoApiKey = process.env.COINGECKO_API_KEY;

if (!dbUrl || !rpcUrl || !cmcApiKey || !lcwApiKey || !coingeckoApiKey) {
  log.error(
    {
      COINGECKO_API_KEY: coingeckoApiKey || null,
      COINMARKETCAP_API_KEY: cmcApiKey || null,
      DATABASE_URL: dbUrl || null,
      LIVECOINWATCH_API_KEY: lcwApiKey || null,
      RPC_NODE_URL: rpcUrl || null,
    },
    'missing config...',
  );
  process.exit();
}

const network: Network =
  process.env.NETWORK === Network.TESTNET ? Network.TESTNET : Network.MAINNET;
const genesisHeight = network === Network.MAINNET ? 9820210 : 42376888;
const genesisDate = network === Network.MAINNET ? '2020-07-21' : '2021-04-01';
const sentryDsn = process.env.SENTRY_DSN;

const config: Config = {
  cmcApiKey,
  coingeckoApiKey,
  dbUrl,
  genesisDate,
  genesisHeight,
  lcwApiKey,
  network,
  rpcUrl,
  sentryDsn,
};

export default config;
