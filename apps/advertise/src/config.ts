import { cleanEnv, str } from 'envalid';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  API_URL: str({ default: 'https://api.exploreblocks.io' }),
  AWS_PUBLIC_URL: str(),
  DATABASE_URL: str(),
});

const config: Config = {
  apiUrl: env.API_URL,
  awsPublicUrl: env.AWS_PUBLIC_URL,
  dbUrl: env.DATABASE_URL,
  port: 3008,
};

export default config;
