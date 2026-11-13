import { DailyTxnStats } from 'nb-schemas';

/** Daily transaction counts as `[timestamp, count]`, oldest first. */
export const getTxnsData = (stats: DailyTxnStats[] | null) =>
  (stats ?? [])
    .toReversed()
    .filter((item) => item.txns !== null)
    .map(
      (item) =>
        [new Date(item.date).getTime(), +item.txns!] as [number, number],
    );
