import { bool, cleanEnv, num, port, str } from 'envalid';

import { logger } from 'nb-logger';

const env = cleanEnv(process.env, {
  ADMIN_PORT: port({ default: 3001 }),
  CACHE_COMPRESSION: bool({ default: false }),
  CACHE_DIR: str({ default: '/app/cache' }),
  CACHE_ENABLED: bool({ default: true }),
  CACHE_TTL_SECS: num({ default: 3600 }),
  FASTNEAR_ENABLED: bool({ default: true }),
  FASTNEAR_URL: str({ default: '' }),
  LOG_LEVEL: str({ default: 'info' }),
  NEAR_LAKE_ACCESS_KEY: str({ default: '' }),
  NEAR_LAKE_BUCKET: str({ default: '' }),
  NEAR_LAKE_ENABLED: bool({ default: false }),
  NEAR_LAKE_REGION: str({ default: 'eu-central-1' }),
  NEAR_LAKE_SECRET_KEY: str({ default: '' }),
  NETWORK: str({ choices: ['mainnet', 'testnet'], default: 'mainnet' }),
  PORT: port({ default: 3000 }),
  S3_ACCESS_KEY: str({ default: '' }),
  S3_BUCKET: str({ default: '' }),
  S3_ENABLED: bool({ default: false }),
  S3_ENDPOINT: str({ default: '' }),
  S3_REGION: str({ default: 'us-east-1' }),
  S3_SECRET_KEY: str({ default: '' }),
  UPSTREAM_TIMEOUT_SECS: num({ default: 30 }),
});

function deriveFastnearUrl(network: string, override_: string): string {
  if (override_) return override_;
  return network === 'testnet'
    ? 'https://testnet.neardata.xyz'
    : 'https://mainnet.neardata.xyz';
}

function deriveNearLakeBucket(network: string, override_: string): string {
  if (override_) return override_;
  return network === 'testnet'
    ? 'near-lake-data-testnet'
    : 'near-lake-data-mainnet';
}

function mask(val: string): string {
  if (!val) return '<unset>';
  if (val.length <= 4) return '***';
  return `${val.slice(0, 4)}***`;
}

if (env.CACHE_COMPRESSION) {
  throw new Error(
    'CACHE_COMPRESSION=true is not yet supported in the TypeScript port. ' +
      'Set CACHE_COMPRESSION=false or remove it to use uncompressed caching.',
  );
}

const config = {
  adminPort: env.ADMIN_PORT,
  cacheCompression: env.CACHE_COMPRESSION,
  cacheDir: env.CACHE_DIR,
  cacheEnabled: env.CACHE_ENABLED,
  cacheTtlSecs: env.CACHE_TTL_SECS,
  fastnearBaseUrl: deriveFastnearUrl(env.NETWORK, env.FASTNEAR_URL),
  fastnearEnabled: env.FASTNEAR_ENABLED,
  logLevel: env.LOG_LEVEL,
  nearLakeAccessKey: env.NEAR_LAKE_ACCESS_KEY,
  nearLakeBucket: deriveNearLakeBucket(env.NETWORK, env.NEAR_LAKE_BUCKET),
  nearLakeEnabled: env.NEAR_LAKE_ENABLED,
  nearLakeRegion: env.NEAR_LAKE_REGION,
  nearLakeSecretKey: env.NEAR_LAKE_SECRET_KEY,
  network: env.NETWORK,
  port: env.PORT,
  s3AccessKey: env.S3_ACCESS_KEY,
  s3Bucket: env.S3_BUCKET,
  s3Enabled: env.S3_ENABLED,
  s3Endpoint: env.S3_ENDPOINT,
  s3Region: env.S3_REGION,
  s3SecretKey: env.S3_SECRET_KEY,
  upstreamTimeoutMs: env.UPSTREAM_TIMEOUT_SECS * 1000,
};

export type Config = typeof config;

export function logConfigSummary(): void {
  logger.info(
    {
      adminPort: config.adminPort,
      cacheCompression: config.cacheCompression,
      cacheDir: config.cacheDir,
      cacheEnabled: config.cacheEnabled,
      cacheTtlSecs: config.cacheTtlSecs,
      fastnearEnabled: config.fastnearEnabled,
      fastnearUrl: config.fastnearBaseUrl,
      nearLakeAccessKey: mask(config.nearLakeAccessKey),
      nearLakeBucket: config.nearLakeBucket,
      nearLakeEffectivelyEnabled:
        config.nearLakeEnabled &&
        !!config.nearLakeAccessKey &&
        !!config.nearLakeSecretKey,
      nearLakeEnabled: config.nearLakeEnabled,
      nearLakeRegion: config.nearLakeRegion,
      nearLakeSecretKey: mask(config.nearLakeSecretKey),
      network: config.network,
      port: config.port,
      s3AccessKey: mask(config.s3AccessKey),
      s3Bucket: config.s3Bucket || '<unset>',
      s3EffectivelyEnabled:
        config.s3Enabled &&
        !!config.s3Endpoint &&
        !!config.s3Bucket &&
        !!config.s3AccessKey &&
        !!config.s3SecretKey,
      s3Enabled: config.s3Enabled,
      s3Endpoint: config.s3Endpoint || '<unset>',
      s3Region: config.s3Region,
      s3SecretKey: mask(config.s3SecretKey),
      upstreamTimeoutSecs: env.UPSTREAM_TIMEOUT_SECS,
    },
    'block-proxy config',
  );
}

export default config;
