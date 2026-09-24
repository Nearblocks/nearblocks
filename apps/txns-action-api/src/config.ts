import { cleanEnv, str } from 'envalid';
import { Config } from './types/types';
import { Network } from 'nb-types';

const env = cleanEnv(process.env, {
  MAINNET_URL: str({ default: 'https://api.nearblocks.io' }),
  TESTNET_URL: str({ default: 'https://api-testnet.nearblocks.io' }),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
});

const config: Config = {
  port: 3001,
  network: env.NETWORK,
  mainnetUrl: env.MAINNET_URL,
  testnetUrl: env.TESTNET_URL,
};

export default config;
