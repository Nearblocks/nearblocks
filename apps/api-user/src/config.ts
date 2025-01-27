import { cleanEnv, str } from 'envalid';

import { Network } from 'nb-types';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  ADMIN_USERNAME: str({ default: '' }),
  AWS_URL: str(),
  DATABASE_URL: str(),
  JWT_SECRET: str(),
  NETWORK: str({
    choices: [Network.MAINNET, Network.TESTNET],
  }),
  REDIS_PASSWORD: str({ default: '' }),
  REDIS_SENTINEL_NAME: str({ default: '' }),
  REDIS_SENTINEL_PASSWORD: str({ default: '' }),
  REDIS_SENTINEL_URLS: str({ default: '' }),
  REDIS_URL: str(),
  SENTRY_DSN: str({ default: '' }),
  SES_ACCESS_KEY: str(),
  SES_EMAIL_FROM: str(),
  SES_REGION: str(),
  SES_SECRET_KEY: str(),
});

const config: Config = {
  adminUsername: env.ADMIN_USERNAME,
  awsUrl: env.AWS_URL,
  dbUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  network: env.NETWORK,
  port: 3008,
  redisPassword: env.REDIS_PASSWORD,
  redisSentinelName: env.REDIS_SENTINEL_NAME,
  redisSentinelPassword: env.REDIS_SENTINEL_PASSWORD,
  redisSentinelUrls: env.REDIS_SENTINEL_URLS,
  redisUrl: env.REDIS_URL,
  sentryDsn: env.SENTRY_DSN,
  sesAccessKey: env.SES_ACCESS_KEY,
  sesEmailFrom: env.SES_EMAIL_FROM,
  sesRegion: env.SES_REGION,
  sesSecretKey: env.SES_SECRET_KEY,
};

export default config;
