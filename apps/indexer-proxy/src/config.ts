import { bool, cleanEnv, num, str, url } from 'envalid';

const rawConfig = cleanEnv(process.env, {
  CACHE_MAX_BLOCKS: num({
    default: 5000,
    desc: 'Maximum blocks in memory cache',
  }),
  CACHE_TTL_MS: num({
    default: 3600000,
    desc: 'Cache TTL in milliseconds (default 1 hour)',
  }),
  DISK_CACHE_PATH: str({
    default: '/tmp/block-cache',
    desc: 'Path for filesystem cache',
  }),
  ENABLE_DISK_CACHE: bool({
    default: false,
    desc: 'Enable filesystem cache persistence',
  }),
  ENABLE_S3_UPLOAD: bool({
    default: true,
    desc: 'Enable background S3 uploads',
  }),
  LAKE_AWS_ACCESS_KEY_ID: str({
    default: '',
    desc: 'AWS access key for NEAR Lake',
  }),
  LAKE_AWS_SECRET_ACCESS_KEY: str({
    default: '',
    desc: 'AWS secret key for NEAR Lake',
  }),
  NETWORK: str({
    choices: ['mainnet', 'testnet'],
    default: 'mainnet',
    desc: 'NEAR network',
  }),
  PORT: num({ default: 3000, desc: 'HTTP server port' }),
  S3_ACCESS_KEY_ID: str({ desc: 'S3 access key' }),
  S3_BUCKET: str({ desc: 'S3 bucket name for block storage' }),
  S3_ENDPOINT: url({ desc: 'S3 endpoint URL' }),
  S3_REGION: str({ default: 'auto', desc: 'S3 region' }),
  S3_SECRET_ACCESS_KEY: str({ desc: 'S3 secret key' }),
  S3_UPLOAD_BATCH_SIZE: num({
    default: 10,
    desc: 'Number of concurrent S3 uploads',
  }),
  S3_UPLOAD_MAX_RETRIES: num({
    default: 5,
    desc: 'Maximum S3 upload retry attempts',
  }),
  SENTRY_DSN: str({ default: '', desc: 'Sentry DSN for error tracking' }),
});

// Derive NEARDATA_URL from NETWORK
const NEARDATA_URL =
  rawConfig.NETWORK === 'mainnet'
    ? 'https://mainnet.neardata.xyz'
    : 'https://testnet.neardata.xyz';

export const config = {
  ...rawConfig,
  NEARDATA_URL,
};
