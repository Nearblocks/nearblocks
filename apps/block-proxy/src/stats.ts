import type { StatsSnapshot } from '#types';

export class StatsCollector {
  cacheEvictions = 0;
  cacheHits = 0;
  cacheMisses = 0;
  cacheWrites = 0;
  dedupLeaders = 0;
  dedupTotal = 0;
  requestsBlock = 0;
  requestsLastBlock = 0;
  upstreamDurationUsFastnear = 0;
  upstreamDurationUsNearLake = 0;
  upstreamDurationUsS3 = 0;
  upstreamErrorsFastnear = 0;
  upstreamErrorsNearLake = 0;
  upstreamErrorsS3 = 0;
  upstreamRequestsFastnear = 0;
  upstreamRequestsNearLake = 0;
  upstreamRequestsS3 = 0;

  snapshot(
    tipHeight: number,
    uptimeSecs: number,
    upstreamEnabled: { fastnear: boolean; nearLake: boolean; s3: boolean },
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
        fastnear: {
          avg_latency_ms: avgLatencyMs(
            this.upstreamDurationUsFastnear,
            this.upstreamRequestsFastnear,
          ),
          enabled: upstreamEnabled.fastnear,
          errors: this.upstreamErrorsFastnear,
          requests: this.upstreamRequestsFastnear,
        },
        near_lake: {
          avg_latency_ms: avgLatencyMs(
            this.upstreamDurationUsNearLake,
            this.upstreamRequestsNearLake,
          ),
          enabled: upstreamEnabled.nearLake,
          errors: this.upstreamErrorsNearLake,
          requests: this.upstreamRequestsNearLake,
        },
        s3: {
          avg_latency_ms: avgLatencyMs(
            this.upstreamDurationUsS3,
            this.upstreamRequestsS3,
          ),
          enabled: upstreamEnabled.s3,
          errors: this.upstreamErrorsS3,
          requests: this.upstreamRequestsS3,
        },
      },
      uptime_secs: uptimeSecs,
    };
  }
}
