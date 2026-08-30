import config from '#config';
import logger from '#libs/logger';

/**
 * Reports how the two-phase `rollingWindow` search resolves.
 *
 * Phase 1 covers the recent window; if that finds nothing, phase 2 repeats the
 * query across all remaining history. A phase-2 call therefore runs twice and
 * scans far more hypertable chunks, so `fallthrough_pct` is a useful signal
 * that traffic has shifted toward older records.
 *
 * Durations cover every query the call made, so phase2 and miss include the
 * wasted phase-1 pass — what the caller actually waits for.
 *
 * Counters are per-process and reset on every report; sum across replicas.
 */

export type WindowPhase = 'error' | 'miss' | 'phase1' | 'phase2' | 'single';

type Tally = { ms: number; n: number };

const PHASES: WindowPhase[] = ['error', 'miss', 'phase1', 'phase2', 'single'];
const REPORT_INTERVAL_MS = 300_000;

const tallies = new Map<string, Record<WindowPhase, Tally>>();

const empty = (): Record<WindowPhase, Tally> => ({
  error: { ms: 0, n: 0 },
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
  if (!config.windowStats) return;

  const entry = tallies.get(label) ?? empty();

  entry[phase].ms += ms;
  entry[phase].n += 1;
  tallies.set(label, entry);
};

const report = (): void => {
  for (const [label, entry] of tallies) {
    const calls = PHASES.reduce((sum, phase) => sum + entry[phase].n, 0);

    if (!calls) continue;

    logger.info(
      {
        calls,
        error_n: entry.error.n,
        fallthrough_pct: Math.round(
          ((entry.miss.n + entry.phase2.n) / calls) * 100,
        ),
        label,
        miss_n: entry.miss.n,
        phase1_mean_ms: mean(entry.phase1),
        phase1_n: entry.phase1.n,
        phase2_mean_ms: mean(entry.phase2),
        phase2_n: entry.phase2.n,
      },
      'rolling window phase split',
    );
  }

  tallies.clear();
};

if (config.windowStats) {
  setInterval(report, REPORT_INTERVAL_MS).unref();
}
