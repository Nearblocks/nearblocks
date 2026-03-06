import { cleanEnv, num, str, url } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  BASE_START_BLOCK: num({ default: 0 }),
  DATABASE_CA: str({ default: '' }),
  DATABASE_CERT: str({ default: '' }),
  DATABASE_KEY: str({ default: '' }),
  DATABASE_URL: str(),
  NEARDATA_URL: url(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  SENTRY_DSN: str({ default: '' }),
});

const genesisHeight = env.NETWORK === Network.MAINNET ? 9_820_210 : 42_376_888;
const genesisTimestamp =
  env.NETWORK === Network.MAINNET
    ? '1595350551591948000'
    : '1596166782911378000';
const genesisFile = `https://s3-us-west-1.amazonaws.com/build.nearprotocol.com/nearcore-deploy/${env.NETWORK}/genesis.json`;

const config: Config = {
  dbCa: env.DATABASE_CA,
  dbCert: env.DATABASE_CERT,
  dbKey: env.DATABASE_KEY,
  dbUrl: env.DATABASE_URL,
  genesisFile: genesisFile, // url to download genesis data
  genesisHeight,
  genesisTimestamp,
  insertLimit: 2_500, // records to insert into the db at a time
  neardataUrl: env.NEARDATA_URL,
  network: env.NETWORK,
  sentryDsn: env.SENTRY_DSN,
  startBlockHeight: env.BASE_START_BLOCK,
};

export default config;
