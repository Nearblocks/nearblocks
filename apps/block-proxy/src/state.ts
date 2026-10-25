import { CacheStore } from '#cache/index';
import type { Config } from '#config';
import type { LocalIndexer } from '#indexer/index';
import { ShadowComparator } from '#shadow';
import { StatsCollector } from '#stats';
import { BlockProxyUpstream, NeardataUpstream } from '#upstream/neardata';

export interface AppState {
  blockProxy: BlockProxyUpstream;
  cache: CacheStore;
  config: Config;
  dedup: Map<string, Promise<{ bytes: Buffer; source: string }>>;
  localIndexer: LocalIndexer | null;
  neardata: NeardataUpstream;
  ready: boolean;
  shadow: null | ShadowComparator;
  startTime: number;
  stats: StatsCollector;
  tipHeight: number;
  version: string;
}

export function createAppState(config: Config): AppState {
  const cache = new CacheStore(config);
  const blockProxy = new BlockProxyUpstream(config);
  const neardata = new NeardataUpstream(config);

  return {
    blockProxy,
    cache,
    config,
    dedup: new Map(),
    localIndexer: null,
    neardata,
    ready: false,
    shadow: ShadowComparator.create(config, { neardata, proxy: blockProxy }),
    startTime: Date.now(),
    stats: new StatsCollector(),
    tipHeight: 0,
    version: process.env.npm_package_version || '0.1.0',
  };
}
