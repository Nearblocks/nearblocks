import { CacheStore } from '#cache/index';
import type { Config } from '#config';
import type { LocalIndexer } from '#indexer/index';
import { StatsCollector } from '#stats';
import { BlockProxyUpstream, NeardataUpstream } from '#upstream/neardata';
import { S3Upstream } from '#upstream/s3';

export interface AppState {
  blockProxy: BlockProxyUpstream;
  cache: CacheStore;
  config: Config;
  dedup: Map<string, Promise<{ bytes: Buffer; source: string }>>;
  localIndexer: LocalIndexer | null;
  neardata: NeardataUpstream;
  neardataEnabled: boolean;
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
  const blockProxy = new BlockProxyUpstream(config);
  const neardata = new NeardataUpstream(config);
  const s3 = S3Upstream.create(config);

  return {
    blockProxy,
    cache,
    config,
    dedup: new Map(),
    localIndexer: null,
    neardata,
    neardataEnabled: config.neardataEnabled,
    ready: false,
    s3,
    s3Enabled: config.s3Enabled && s3 !== null,
    startTime: Date.now(),
    stats: new StatsCollector(),
    tipHeight: 0,
    version: process.env.npm_package_version || '0.1.0',
  };
}
