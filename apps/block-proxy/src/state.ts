import { CacheStore } from '#cache/index';
import type { Config } from '#config';
import { StatsCollector } from '#stats';
import { FastnearUpstream } from '#upstream/fastnear';
import { NearLakeUpstream } from '#upstream/near-lake';
import { S3Upstream } from '#upstream/s3';

export interface AppState {
  cache: CacheStore;
  config: Config;
  dedup: Map<string, Promise<{ bytes: Buffer; source: string }>>;
  fastnear: FastnearUpstream;
  fastnearEnabled: boolean;
  nearLake: NearLakeUpstream | null;
  nearLakeEnabled: boolean;
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
  const fastnear = new FastnearUpstream(config);
  const s3 = S3Upstream.create(config);
  const nearLake = config.nearLakeEnabled ? new NearLakeUpstream(config) : null;

  return {
    cache,
    config,
    dedup: new Map(),
    fastnear,
    fastnearEnabled: config.fastnearEnabled,
    nearLake,
    nearLakeEnabled: config.nearLakeEnabled && nearLake !== null,
    ready: false,
    s3,
    s3Enabled: config.s3Enabled && s3 !== null,
    startTime: Date.now(),
    stats: new StatsCollector(),
    tipHeight: 0,
    version: process.env.npm_package_version || '0.1.0',
  };
}
