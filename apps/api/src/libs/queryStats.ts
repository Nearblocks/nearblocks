import logger from '#libs/logger';

type Tally = { ms: number; n: number };

type Entry = { error: Tally; ok: Tally };

const REPORT_INTERVAL_MS = 60_000;

const tallies = new Map<string, Entry>();

const empty = (): Entry => ({
  error: { ms: 0, n: 0 },
  ok: { ms: 0, n: 0 },
});

const mean = (tally: Tally): number =>
  tally.n ? Math.round(tally.ms / tally.n) : 0;

const shortPath = (path: string): string =>
  path.replace(/^.*[/\\]sql[/\\]/, '');

export const recordQuery = (
  queryFilePath: string | undefined,
  ms: number,
  failed: boolean,
): void => {
  const label = queryFilePath ? shortPath(queryFilePath) : 'adhoc';
  const entry = tallies.get(label) ?? empty();
  const tally = failed ? entry.error : entry.ok;

  tally.ms += ms;
  tally.n += 1;
  tallies.set(label, entry);
};

const report = (): void => {
  for (const [label, entry] of tallies) {
    const calls = entry.ok.n + entry.error.n;

    if (!calls) continue;

    logger.info(
      {
        calls,
        db_ms: Math.round(entry.ok.ms + entry.error.ms),
        error_n: entry.error.n,
        label,
        ok_mean_ms: mean(entry.ok),
        ok_n: entry.ok.n,
      },
      'query stats',
    );
  }

  tallies.clear();
};

setInterval(report, REPORT_INTERVAL_MS).unref();
