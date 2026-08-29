import logger from '#libs/logger';

/**
 * Temporary instrumentation for the two-phase `rollingWindow` search.
 *
 * `rollingWindow` looks in the recent window first, then falls back to all of
 * history. The fallback scans ~63 hypertable chunks instead of ~12 and costs
 * ~39ms in planning alone -- planning is 94% of that query's cost, not data
 * access.
 *
 * Records both how often each phase runs and how long it takes, so the log
 * answers "is a transaction_hash -> block_timestamp lookup table worth the
 * backfill" on its own, without cross-referencing pg_stat_statements.
 *
 * Durations cover every query the call made, so a phase2 or miss includes the
 * wasted phase1 pass. That is what the caller actually waits for.
 *
 * Counters are in-process and reset on every report, so sum across replicas.
 * Remove this module once the question is answered.
 */

export type WindowPhase = 'miss' | 'phase1' | 'phase2' | 'single';

type Tally = { ms: number; n: number };

const PHASES: WindowPhase[] = ['miss', 'phase1', 'phase2', 'single'];
const REPORT_INTERVAL_MS = 60_000;

const tallies = new Map<string, Record<WindowPhase, Tally>>();

const empty = (): Record<WindowPhase, Tally> => ({
  miss: { ms: 0, n: 0 },
  phase1: { ms: 0, n: 0 },
  phase2: { ms: 0, n: 0 },
  single: { ms: 0, n: 0 },
});

const mean = (tally: Tally): number =>
  tally.n ? Math.round(tally.ms / tally.n) : 0;

export const recordWindowPhase = (
  label: string,
  phase: WindowPhase,
  ms: number,
): void => {
  const entry = tallies.get(label) ?? empty();

  entry[phase].ms += ms;
  entry[phase].n += 1;
  tallies.set(label, entry);
};

const report = (): void => {
  for (const [label, entry] of tallies) {
    const calls = PHASES.reduce((sum, phase) => sum + entry[phase].n, 0);

    if (!calls) continue;

    const dbMs = PHASES.reduce((sum, phase) => sum + entry[phase].ms, 0);
    const fallthrough = entry.miss.n + entry.phase2.n;

    logger.info(
      {
        calls,
        db_ms: Math.round(dbMs),
        fallthrough_ms: Math.round(entry.miss.ms + entry.phase2.ms),
        fallthrough_pct: Math.round((fallthrough / calls) * 100),
        label,
        miss_mean_ms: mean(entry.miss),
        miss_n: entry.miss.n,
        phase1_mean_ms: mean(entry.phase1),
        phase1_n: entry.phase1.n,
        phase2_mean_ms: mean(entry.phase2),
        phase2_n: entry.phase2.n,
        single_mean_ms: mean(entry.single),
        single_n: entry.single.n,
      },
      'rolling window phase split',
    );
  }

  tallies.clear();
};

setInterval(report, REPORT_INTERVAL_MS).unref();
