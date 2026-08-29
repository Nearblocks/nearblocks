import logger from '#libs/logger';

/**
 * Temporary instrumentation for the two-phase `rollingWindow` search.
 *
 * `rollingWindow` looks in the recent window first, then falls back to all of
 * history. The fallback scans ~63 hypertable chunks instead of ~12 and costs
 * ~39ms in planning alone, so the phase split decides whether a
 * `transaction_hash -> block_timestamp` lookup table is worth building.
 *
 * Counters are in-process and reset on every report, so sum across replicas.
 * Remove this module once the question is answered.
 */

export type WindowPhase = 'miss' | 'phase1' | 'phase2' | 'single';

const REPORT_INTERVAL_MS = 60_000;

const counts = new Map<string, Record<WindowPhase, number>>();

const empty = (): Record<WindowPhase, number> => ({
  miss: 0,
  phase1: 0,
  phase2: 0,
  single: 0,
});

export const recordWindowPhase = (label: string, phase: WindowPhase): void => {
  const entry = counts.get(label) ?? empty();

  entry[phase] += 1;
  counts.set(label, entry);
};

const report = (): void => {
  for (const [label, entry] of counts) {
    const total = entry.miss + entry.phase1 + entry.phase2 + entry.single;

    if (!total) continue;

    logger.info(
      {
        fallthrough_pct: Math.round(((entry.miss + entry.phase2) / total) * 100),
        label,
        miss: entry.miss,
        phase1: entry.phase1,
        phase2: entry.phase2,
        single: entry.single,
        total,
      },
      'rolling window phase split',
    );
  }

  counts.clear();
};

setInterval(report, REPORT_INTERVAL_MS).unref();
