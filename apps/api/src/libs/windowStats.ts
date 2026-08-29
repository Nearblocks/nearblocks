import logger from '#libs/logger';

/**
 * Temporary instrumentation for the two-phase `rollingWindow` search.
 *
 * `rollingWindow` looks in the recent 360-day window first, then falls back to
 * all of history. The fallback scans ~63 hypertable chunks instead of ~12 and
 * costs ~39ms in planning alone -- planning is 94% of that query's cost, not
 * data access.
 *
 * It exists to answer one question: do transaction lookups mostly fall through
 * to the history phase, and is a `transaction_hash -> block_timestamp` lookup
 * table therefore worth a backfill over billions of rows?
 *
 * READ `removable_ms_est`, NOT `fallthrough_ms`.
 *
 *   fallthrough_ms   total wall time of fallthrough calls. For the
 *                    `txn.receipts.*` labels this INCLUDES the receipt_tree()
 *                    recursion, which a lookup table would not remove -- it
 *                    overstates the payoff by roughly 2x.
 *   removable_ms_est `miss_mean_ms x fallthrough_n`. A miss found nothing, so
 *                    it did no receipt_tree work: its duration is pure
 *                    two-phase lookup cost and is ~100% removable. This is the
 *                    honest lower bound.
 *
 * Only the two-phase `rollingWindow` is instrumented. `rollingWindowList` and
 * `rollingWindowCount` loop over many windows sequentially and may account for
 * more database time per request; they are not counted here, so `db_ms` is not
 * this API's total database cost.
 *
 * Counters are in-process and reset on every report, so sum across replicas.
 * Remove this module once the question is answered.
 */

export type WindowPhase = 'error' | 'miss' | 'phase1' | 'phase2' | 'single';

type Tally = { ms: number; n: number };

const PHASES: WindowPhase[] = ['error', 'miss', 'phase1', 'phase2', 'single'];
const REPORT_INTERVAL_MS = 60_000;

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
  const entry = tallies.get(label) ?? empty();

  entry[phase].ms += ms;
  entry[phase].n += 1;
  tallies.set(label, entry);
};

const report = (): void => {
  for (const [label, entry] of tallies) {
    const calls = PHASES.reduce((sum, phase) => sum + entry[phase].n, 0);

    if (!calls) continue;

    const fallthroughN = entry.miss.n + entry.phase2.n;

    logger.info(
      {
        calls,
        db_ms: Math.round(PHASES.reduce((sum, p) => sum + entry[p].ms, 0)),
        error_mean_ms: mean(entry.error),
        error_n: entry.error.n,
        fallthrough_ms: Math.round(entry.miss.ms + entry.phase2.ms),
        fallthrough_n: fallthroughN,
        fallthrough_pct: Math.round((fallthroughN / calls) * 100),
        label,
        miss_mean_ms: mean(entry.miss),
        miss_n: entry.miss.n,
        phase1_mean_ms: mean(entry.phase1),
        phase1_n: entry.phase1.n,
        phase2_mean_ms: mean(entry.phase2),
        phase2_n: entry.phase2.n,
        removable_ms_est: mean(entry.miss) * fallthroughN,
        single_mean_ms: mean(entry.single),
        single_n: entry.single.n,
      },
      'rolling window phase split (two-phase rollingWindow only)',
    );
  }

  tallies.clear();
};

setInterval(report, REPORT_INTERVAL_MS).unref();
