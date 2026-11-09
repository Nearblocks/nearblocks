'use client';

import { use, useEffect, useMemo, useState } from 'react';

import { EChart } from '@/components/echarts/chart';
import { echarts } from '@/components/echarts/core';
import { useChartTheme } from '@/components/echarts/use-chart-theme';
import type { NodeStats } from '@/data/nodes';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type GeoJson = { features: { properties: { name: string } }[] };

type Props = {
  loading?: boolean;
  statsPromise?: Promise<NodeStats | null>;
};

// Same steps and palette as the account activity heatmap.
const PIECES = [
  { max: 0, min: 0 },
  { max: 4, min: 1 },
  { max: 19, min: 5 },
  { max: 99, min: 20 },
  { min: 100 },
];

const pieceLabel = (piece: { max?: number; min: number }) =>
  piece.max === undefined
    ? `${numberFormat(piece.min)}+`
    : piece.min === piece.max
      ? numberFormat(piece.min)
      : `${numberFormat(piece.min)} - ${numberFormat(piece.max)}`;

const top = (counts: Record<string, number>, n: number) =>
  Object.entries(counts)
    .filter(([key]) => key !== 'unknown' && key !== '')
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);

// Natural Earth outlines keyed by ISO alpha-2 (scripts/build-world-map.mjs). Fetched
// and registered once per page load, shared by every render.
let worldMap: null | Promise<null | string[]> = null;

const loadWorldMap = () => {
  worldMap ??= fetch('/maps/world-110m.geo.json')
    .then((res) => {
      if (!res.ok) throw new Error(`map ${res.status}`);
      return res.json() as Promise<GeoJson>;
    })
    .then((geo) => {
      echarts.registerMap('world', geo as never);
      return geo.features.map((f) => f.properties.name);
    })
    .catch(() => {
      worldMap = null;
      return null;
    });
  return worldMap;
};

// undefined while loading, null if the map could not be loaded.
const useWorldMap = (enabled: boolean) => {
  const [codes, setCodes] = useState<null | string[] | undefined>(undefined);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void loadWorldMap().then((result) => {
      if (active) setCodes(result);
    });
    return () => {
      active = false;
    };
  }, [enabled]);
  return codes;
};

export const NodesMap = ({ loading, statsPromise }: Props) => {
  const { locale, t } = useLocale('validators');
  const stats = !loading && statsPromise ? use(statsPromise) : null;
  const codes = useWorldMap(!loading);
  const theme = useChartTheme();

  const regionName = useMemo(() => {
    const names = new Intl.DisplayNames([locale, 'en'], { type: 'region' });
    return (code: string) => {
      try {
        return names.of(code) ?? code;
      } catch {
        return code;
      }
    };
  }, [locale]);

  const option = useMemo(() => {
    if (!codes || !theme) return null;
    const byCountry = stats?.by_country ?? {};
    return {
      series: [
        {
          data: codes.map((code) => ({
            name: code,
            value: byCountry[code] ?? 0,
          })),
          emphasis: {
            itemStyle: { borderColor: theme.foreground },
            label: { show: false },
          },
          itemStyle: { borderColor: theme.card, borderWidth: 0.5 },
          map: 'world',
          roam: false,
          select: { disabled: true },
          type: 'map',
        },
      ],
      tooltip: {
        backgroundColor: theme.card,
        borderColor: theme.border,
        // Country name from Intl and a number: nothing node-supplied is rendered.
        formatter: (p: { name: string; value?: number }) =>
          `${regionName(p.name)}: ${numberFormat(p.value ?? 0)}`,
        textStyle: { color: theme.foreground, fontSize: 12 },
      },
      visualMap: {
        inRange: { color: theme.scale },
        pieces: PIECES,
        show: false,
        type: 'piecewise',
      },
    };
  }, [codes, regionName, stats, theme]);

  const countries = top(stats?.by_country ?? {}, 8);
  const versions = top(stats?.by_version ?? {}, 6);

  return (
    <Card>
      <CardHeader className="border-b py-3">
        <CardTitle className="text-headline-sm">
          {t('nodesMap.title')}
        </CardTitle>
        {stats && (
          <span className="text-body-sm text-muted-foreground">
            {t('nodesMap.online', {
              nodes: numberFormat(stats.total),
              validators: numberFormat(stats.validators),
            })}
          </span>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading || codes === undefined || (codes && !option) ? (
            <Skeleton className="h-90 w-full" />
          ) : option ? (
            <EChart
              className="h-90"
              label={t('nodesMap.title')}
              option={option}
            />
          ) : null}
          {!loading && (!stats || codes === null) ? (
            <p className="mt-2 text-body-sm text-muted-foreground">
              {t('nodesMap.noData')}
            </p>
          ) : (
            <div className="mt-2 flex items-center justify-end gap-1 text-body-xs text-muted-foreground">
              {PIECES.map((piece, index) => (
                <span
                  aria-label={pieceLabel(piece)}
                  className="block h-3 w-3 rounded-xs"
                  key={piece.min}
                  role="img"
                  style={{ background: theme?.scale[index] }}
                  title={pieceLabel(piece)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <section>
            <h3 className="mb-2 text-body-sm text-muted-foreground">
              {t('nodesMap.countries')}
            </h3>
            <ul className="space-y-1">
              {countries.map(([code, count]) => (
                <li className="flex justify-between gap-2" key={code}>
                  <span className="truncate">{regionName(code)}</span>
                  <span className="text-muted-foreground">
                    {numberFormat(count)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="mb-2 text-body-sm text-muted-foreground">
              {t('nodesMap.versions')}
            </h3>
            <ul className="space-y-1">
              {versions.map(([version, count]) => (
                <li className="flex justify-between gap-2" key={version}>
                  {/* Self-reported by nodes: rendered as React text only. */}
                  <span className="truncate font-mono">{version}</span>
                  <span className="text-muted-foreground">
                    {numberFormat(count)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <p className="text-body-xs text-muted-foreground">
            {t('nodesMap.note')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
