import { cleanEnv, str } from 'envalid';
import { Config } from './types/types';
import { Network } from 'nb-types';

const env = cleanEnv(process.env, {
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
});

const config: Config = {
  port: 3001,
  network: env.NETWORK,
};

export default config;
