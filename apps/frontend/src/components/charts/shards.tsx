'use client';

import { use, useMemo, useState } from 'react';

import { TpsStats } from 'nb-schemas';

import { SkeletonSlot } from '@/components/skeleton';
import { useLocale } from '@/hooks/use-locale';
import { dateFormat, numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  loading?: boolean;
  statsPromise?: Promise<null | TpsStats[]>;
};

type Bucket = { loads: Map<number, number>; ts: number };

type ShardData = {
  buckets: Bucket[];
  current: { id: number; load: number }[];
  maxCell: number;
  shardIds: number[];
  totalCurrent: number;
};

// Number of trailing buckets treated as the "current" rolling window.
const ROLLING_BUCKETS = 5;

const getShardData = (stats: null | TpsStats[]): ShardData => {
  // API returns newest-first; reverse to oldest -> newest for a left-to-right timeline.
  const ordered = (stats ?? []).toReversed();

  const buckets: Bucket[] = ordered.map((item) => ({
    loads: new Map(item.shards.map((s) => [s.shard, s.txns])),
    ts: Number(item.date) * 1000,
  }));

  // tps_stats only includes shards that produced a txn in a bucket, so the true
  // shard set is the union across the window. IDs are sparse — order numerically
  // for display, never assume a contiguous 0..N range.
  const shardIds = [
    ...new Set(ordered.flatMap((item) => item.shards.map((s) => s.shard))),
  ].sort((a, b) => a - b);

  const maxCell = Math.max(
    1,
    ...ordered.flatMap((item) => item.shards.map((s) => s.txns)),
  );

  const recent = buckets.slice(-ROLLING_BUCKETS);
  const current = shardIds.map((id) => ({
    id,
    load: recent.reduce((sum, b) => sum + (b.loads.get(id) ?? 0), 0),
  }));
  const totalCurrent = Math.max(
    1,
    current.reduce((sum, c) => sum + c.load, 0),
  );

  return { buckets, current, maxCell, shardIds, totalCurrent };
};

// Perceptual (sqrt) intensity so a hot shard doesn't wash out the quieter ones.
const cellColor = (load: number, maxCell: number): string => {
  if (load <= 0) return 'transparent';
  const pct = 14 + 86 * Math.sqrt(load / maxCell);
  return `color-mix(in oklab, var(--color-teal-500) ${pct}%, transparent)`;
};

export const ShardsChart = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;
  const data = useMemo(() => getShardData(stats), [stats]);

  const { buckets, current, maxCell, shardIds, totalCurrent } = data;
  const firstTs = buckets[0]?.ts;
  const lastTs = buckets[buckets.length - 1]?.ts;
  const [hover, setHover] = useState<{
    id: number;
    load: number;
    ts: number;
  } | null>(null);

  return (
    <Card>
      <CardHeader className="flex-wrap gap-1 border-b">
        <p className="text-body-sm text-muted-foreground">
          {t('shards.description')}
        </p>
      </CardHeader>
      <CardContent className="p-3">
        <SkeletonSlot
          fallback={<Skeleton className="h-140 w-full" />}
          loading={loading || !stats}
        >
          {() =>
            shardIds.length === 0 ? (
              <p className="text-body-sm text-muted-foreground py-10 text-center">
                {t('shards.empty')}
              </p>
            ) : (
              <div className="flex flex-col gap-6">
                <section className="flex flex-col gap-3">
                  <span className="text-headline-sm flex items-center gap-2">
                    {t('shards.layoutTitle')}
                    <span className="text-body-sm text-muted-foreground font-normal">
                      {t('shards.activeCount', { count: shardIds.length })}
                    </span>
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {current.map((shard) => {
                      const share = (shard.load / totalCurrent) * 100;
                      return (
                        <div
                          className="border-border bg-card flex min-w-28 flex-1 flex-col gap-2 rounded-lg border p-3"
                          key={shard.id}
                        >
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-body-sm font-medium">
                              {t('shards.shardLabel', { id: shard.id })}
                            </span>
                            <span
                              className="text-body-xs text-muted-foreground"
                              title={t('shards.shareLabel')}
                            >
                              {numberFormat(share, {
                                maximumFractionDigits: 1,
                              })}
                              %
                            </span>
                          </span>
                          <span
                            className="bg-muted h-1.5 overflow-hidden rounded-full"
                            role="presentation"
                          >
                            <span
                              className="block h-full rounded-full"
                              style={{
                                backgroundColor: 'var(--color-teal-500)',
                                width: `${Math.max(share, 2)}%`,
                              }}
                            />
                          </span>
                          <span className="text-body-xs text-muted-foreground">
                            {t('shards.rollingTxns', {
                              count: numberFormat(shard.load, {
                                maximumFractionDigits: 0,
                              }),
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="flex flex-col gap-3">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-headline-sm">
                      {t('shards.heatmapTitle')}
                    </span>
                    {hover ? (
                      <span className="text-body-xs text-foreground font-medium">
                        {t('shards.shardLabel', { id: hover.id })} ·{' '}
                        {dateFormat(hover.ts, 'MMM D, YYYY HH:mm')} ·{' '}
                        {t('shards.rollingTxns', {
                          count: numberFormat(hover.load, {
                            maximumFractionDigits: 0,
                          }),
                        })}
                      </span>
                    ) : (
                      <span className="text-body-xs text-muted-foreground flex items-center gap-1.5">
                        {t('shards.less')}
                        <span
                          className="h-2 w-16 rounded-full"
                          style={{
                            background:
                              'linear-gradient(to right, color-mix(in oklab, var(--color-teal-500) 14%, transparent), var(--color-teal-500))',
                          }}
                        />
                        {t('shards.more')}
                      </span>
                    )}
                  </span>
                  <div className="flex flex-col gap-1">
                    {shardIds.map((id) => (
                      <div className="flex items-center gap-2" key={id}>
                        <span className="text-body-xs text-muted-foreground w-16 shrink-0 text-right whitespace-nowrap">
                          {t('shards.shardLabel', { id })}
                        </span>
                        <div className="flex flex-1 gap-px">
                          {buckets.map((bucket) => {
                            const load = bucket.loads.get(id) ?? 0;
                            return (
                              <span
                                className="bg-muted/40 h-5 flex-1 rounded-xs transition hover:ring-2 hover:ring-white/70 hover:brightness-125 hover:ring-inset"
                                key={bucket.ts}
                                onMouseEnter={() =>
                                  setHover({ id, load, ts: bucket.ts })
                                }
                                onMouseLeave={() => setHover(null)}
                                style={{
                                  backgroundColor:
                                    load > 0
                                      ? cellColor(load, maxCell)
                                      : undefined,
                                }}
                                title={`${t('shards.shardLabel', {
                                  id,
                                })} · ${dateFormat(
                                  bucket.ts,
                                  'MMM D, YYYY HH:mm',
                                )} · ${load} txns`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {firstTs && lastTs ? (
                    <div className="text-body-xs text-muted-foreground flex justify-between pl-18">
                      <span>{dateFormat(firstTs, 'MMM D, YYYY HH:mm')}</span>
                      <span>{dateFormat(lastTs, 'MMM D, YYYY HH:mm')}</span>
                    </div>
                  ) : null}
                  <p className="text-body-xs text-muted-foreground">
                    {t('shards.footnote')}
                  </p>
                </section>
              </div>
            )
          }
        </SkeletonSlot>
      </CardContent>
    </Card>
  );
};

export const ShardsChartMini = ({ loading, statsPromise }: Props) => {
  const { t } = useLocale('charts');
  const stats = !loading && statsPromise ? use(statsPromise) : null;
  const data = useMemo(() => getShardData(stats), [stats]);

  const maxLoad = Math.max(1, ...data.current.map((c) => c.load));

  return (
    <div className="h-55">
      <SkeletonSlot
        fallback={<Skeleton className="my-3 h-49 w-full" />}
        loading={loading || !stats}
      >
        {() => (
          <div className="flex h-49 flex-col justify-end gap-3 py-3">
            <span className="text-display-xs">
              {t('shards.activeCount', { count: data.shardIds.length })}
            </span>
            <div className="flex flex-1 items-end gap-1">
              {data.current.map((shard) => (
                <div
                  className="flex flex-1 flex-col items-center gap-1"
                  key={shard.id}
                  title={`${t('shards.shardLabel', { id: shard.id })} · ${
                    shard.load
                  } txns`}
                >
                  <span
                    className="w-full rounded-t-xs"
                    style={{
                      backgroundColor: 'var(--color-teal-500)',
                      height: `${Math.max((shard.load / maxLoad) * 100, 3)}%`,
                    }}
                  />
                  <span className="text-body-xs text-muted-foreground">
                    {shard.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </SkeletonSlot>
    </div>
  );
};
