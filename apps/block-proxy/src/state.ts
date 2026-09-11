import { CacheStore } from '#cache/index';
import type { Config } from '#config';
import { StatsCollector } from '#stats';
import { UpstreamPool } from '#upstream/pool';
import { S3Upstream } from '#upstream/s3';

export interface AppState {
  cache: CacheStore;
  config: Config;
  dedup: Map<string, Promise<{ bytes: Buffer; source: string }>>;
  fastnearEnabled: boolean;
  pool: UpstreamPool;
  ready: boolean;
  s3: null | S3Upstream;
  s3Enabled: boolean;
  startTime: number;
  stats: StatsCollector;
  tipHeight: number;
  version: string;
}

export function createAppState(config: Config): AppState {
  const cache = new CacheStore(config);
  const pool = UpstreamPool.fromConfig(
    config.upstreams,
    config.upstreamTimeoutMs,
    config.cooldownBaseMs,
    config.cooldownMaxMs,
  );
  const s3 = S3Upstream.create(config);

  return {
    cache,
    config,
    dedup: new Map(),
    fastnearEnabled: config.fastnearEnabled,
    pool,
    ready: false,
    s3,
    s3Enabled: config.s3Enabled && s3 !== null,
    startTime: Date.now(),
    stats: new StatsCollector(),
    tipHeight: 0,
    version: process.env.npm_package_version || '0.1.0',
  };
}
