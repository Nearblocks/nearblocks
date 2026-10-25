import type { StatsSnapshot } from '#types';

export class StatsCollector {
  cacheEvictions = 0;
  cacheHits = 0;
  cacheMisses = 0;
  cacheWrites = 0;
  dedupDeadlines = 0;
  dedupLeaders = 0;
  dedupTotal = 0;
  proxyNullOverridden = 0;
  requestsBlock = 0;
  requestsLastBlock = 0;
  upstreamDurationUsNeardata = 0;
  upstreamDurationUsProxy = 0;
  upstreamErrorsNeardata = 0;
  upstreamErrorsProxy = 0;
  upstreamRequestsNeardata = 0;
  upstreamRequestsProxy = 0;

  snapshot(
    tipHeight: number,
    uptimeSecs: number,
    upstreamEnabled: { neardata: boolean; proxy: boolean },
  ): StatsSnapshot {
    const cacheTotal = this.cacheHits + this.cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? this.cacheHits / cacheTotal : 0;
    const dedupSaves = Math.max(0, this.dedupTotal - this.dedupLeaders);

    const avgLatencyMs = (durationUs: number, count: number): number =>
      count > 0 ? durationUs / count / 1000 : 0;

    return {
      cache: {
        evictions: this.cacheEvictions,
        hit_rate: cacheHitRate,
        hits: this.cacheHits,
        misses: this.cacheMisses,
        writes: this.cacheWrites,
      },
      dedup: {
        deadlines: this.dedupDeadlines,
        leaders: this.dedupLeaders,
        saves: dedupSaves,
        total: this.dedupTotal,
      },
      requests: {
        block: this.requestsBlock,
        last_block: this.requestsLastBlock,
      },
      tip_height: tipHeight,
      upstreams: {
        neardata: {
          avg_latency_ms: avgLatencyMs(
            this.upstreamDurationUsNeardata,
            this.upstreamRequestsNeardata,
          ),
          enabled: upstreamEnabled.neardata,
          errors: this.upstreamErrorsNeardata,
          requests: this.upstreamRequestsNeardata,
        },
        proxy: {
          avg_latency_ms: avgLatencyMs(
            this.upstreamDurationUsProxy,
            this.upstreamRequestsProxy,
          ),
          enabled: upstreamEnabled.proxy,
          errors: this.upstreamErrorsProxy,
          requests: this.upstreamRequestsProxy,
        },
      },
      uptime_secs: uptimeSecs,
    };
  }
}
