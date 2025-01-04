import { cleanEnv, num, str } from 'envalid';

import { Config } from '#types/types';

const env = cleanEnv(process.env, {
  ADMIN_USERNAME: str({ default: 'nearblocks' }),
  API_URL: str({ default: 'https://api.exploreblocks.io/api' }),
  AWS_URL: str(),
  DATABASE_URL: str(),
  JWT_SECRET: str(),
  REDIS_PASSWORD: str({ default: '' }),
  REDIS_SENTINEL_NAME: str({ default: '' }),
  REDIS_SENTINEL_PASSWORD: str({ default: '' }),
  REDIS_SENTINEL_URLS: str({ default: '' }),
  REDIS_URL: str(),
  SENTRY_DSN: str({ default: '' }),
  SMTP_EMAIL: str(),
  SMTP_HOST: str(),
  SMTP_PASS: str(),
  SMTP_PORT: num(),
  SMTP_USER: str(),
});

const config: Config = {
  adminUsername: env.ADMIN_USERNAME,
  apiUrl: env.API_URL,
  awsUrl: env.AWS_URL,
  dbUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  port: 3008,
  redisPassword: env.REDIS_PASSWORD,
  redisSentinelName: env.REDIS_SENTINEL_NAME,
  redisSentinelPassword: env.REDIS_SENTINEL_PASSWORD,
  redisSentinelUrls: env.REDIS_SENTINEL_URLS,
  redisUrl: env.REDIS_URL,
  sentryDsn: env.SENTRY_DSN,
  smtpHost: env.SMTP_HOST,
  smtpMail: env.SMTP_EMAIL,
  smtpPass: env.SMTP_PASS,
  smtpPort: env.SMTP_PORT,
  smtpUser: env.SMTP_USER,
};

export default config;
