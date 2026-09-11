import type { SourceStats, StatsSnapshot, UpstreamStats } from '#types';

interface UpstreamCounters {
  durationUs: number;
  errors: number;
  requests: number;
}

export class StatsCollector {
  // Keyed by upstream name, so the pool can grow without touching this file.
  private upstreams = new Map<string, UpstreamCounters>();
  cacheEvictions = 0;
  cacheHits = 0;
  cacheMisses = 0;
  cacheWrites = 0;
  dedupDeadlines = 0;
  dedupLeaders = 0;
  dedupTotal = 0;
  requestsBlock = 0;

  requestsLastBlock = 0;

  recordUpstream(source: string, elapsedMs: number, ok: boolean): void {
    let counters = this.upstreams.get(source);

    if (!counters) {
      counters = { durationUs: 0, errors: 0, requests: 0 };
      this.upstreams.set(source, counters);
    }

    counters.requests += 1;
    counters.durationUs += elapsedMs * 1000;
    if (!ok) counters.errors += 1;
  }

  snapshot(
    tipHeight: number,
    uptimeSecs: number,
    enabledSources: string[],
  ): StatsSnapshot {
    const cacheTotal = this.cacheHits + this.cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? this.cacheHits / cacheTotal : 0;
    const dedupSaves = Math.max(0, this.dedupTotal - this.dedupLeaders);

    const avgLatencyMs = (durationUs: number, count: number): number =>
      count > 0 ? durationUs / count / 1000 : 0;

    const enabled = new Set(enabledSources);
    const upstreams: UpstreamStats = {};

    // Union of configured and observed, so a disabled-but-used source still
    // shows its history and a configured-but-idle one still shows as enabled.
    for (const source of new Set([...enabled, ...this.upstreams.keys()])) {
      const counters = this.upstreams.get(source);
      const stats: SourceStats = {
        avg_latency_ms: avgLatencyMs(
          counters?.durationUs ?? 0,
          counters?.requests ?? 0,
        ),
        enabled: enabled.has(source),
        errors: counters?.errors ?? 0,
        requests: counters?.requests ?? 0,
      };

      upstreams[source] = stats;
    }

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
      upstreams,
      uptime_secs: uptimeSecs,
    };
  }
}
