'use client';

import { Map as MapIcon } from 'lucide-react';
import { use, useEffect, useMemo, useState } from 'react';

import { EChart } from '@/components/echarts/chart';
import { echarts } from '@/components/echarts/core';
import { useChartTheme } from '@/components/echarts/use-chart-theme';
import { EmptyBox } from '@/components/empty';
import {
  nodesMapOption,
  stepColors,
  STEPS,
} from '@/components/nodes/map-option';
import {
  COUNTRY_ROWS,
  MapSkeleton,
  NodesMapSkeleton,
  VERSION_ROWS,
} from '@/components/nodes/nodes-skeleton';
import type { NodeStats } from '@/data/nodes';
import { useLocale } from '@/hooks/use-locale';
import { numberFormat } from '@/lib/format';
import { Card, CardContent, CardHeader } from '@/ui/card';

type GeoJson = { features: { properties: { name: string } }[] };

type Props = {
  loading?: boolean;
  statsPromise?: Promise<NodeStats | null>;
};

const stepLabel = (step: { max?: number; min: number }) =>
  step.max === undefined
    ? `${numberFormat(step.min)}+`
    : step.min === step.max
      ? numberFormat(step.min)
      : `${numberFormat(step.min)}–${numberFormat(step.max)}`;

const top = (counts: Record<string, number>, n: number) =>
  Object.entries(counts)
    .filter(([key]) => key !== 'unknown' && key !== '')
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);

const NodeList = ({
  rows,
  title,
}: {
  rows: [string, number][];
  title: string;
}) => (
  <section>
    <h3 className="mb-2 text-body-xs text-muted-foreground">{title}</h3>
    <ul className="space-y-1 text-body-sm">
      {rows.map(([label, count]) => (
        <li className="flex justify-between gap-2" key={label}>
          <span className="truncate">{label}</span>
          <span className="text-muted-foreground tabular-nums">
            {numberFormat(count)}
          </span>
        </li>
      ))}
    </ul>
  </section>
);

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
    return nodesMapOption({
      codes,
      counts: stats?.by_country ?? {},
      theme,
      // Country name from Intl, a locale string and a number: nothing node-supplied.
      tooltip: (code, value) =>
        `<span>${regionName(code)}</span><br/><span style="color:${theme.series}">●</span> ${t(
          'nodesMap.series',
        )}: <b>${numberFormat(value)}</b>`,
    });
  }, [codes, regionName, stats, t, theme]);

  if (loading) return <NodesMapSkeleton />;

  const colors = theme && stepColors(theme);

  return (
    <Card>
      <CardHeader className="flex-wrap gap-2 border-b">
        <p className="text-body-sm text-muted-foreground">
          {t('nodesMap.description')}
        </p>
        {stats && (
          <span className="text-body-xs whitespace-nowrap text-muted-foreground tabular-nums">
            {t('nodesMap.online', {
              nodes: numberFormat(stats.total),
              validators: numberFormat(stats.validators),
            })}
          </span>
        )}
      </CardHeader>
      {stats ? (
        <CardContent className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-3">
          <div className="lg:col-span-2 lg:self-center">
            {codes === null ? (
              <div className="flex aspect-9/4 w-full">
                <EmptyBox
                  description={t('nodesMap.mapError')}
                  icon={<MapIcon />}
                />
              </div>
            ) : !option || !colors ? (
              <MapSkeleton />
            ) : (
              <>
                <EChart
                  className="aspect-9/4"
                  label={t('nodesMap.title')}
                  option={option}
                />
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-xs text-muted-foreground">
                  <span>{t('nodesMap.legend')}</span>
                  {STEPS.map((step, index) => (
                    <span className="flex items-center gap-1" key={step.min}>
                      <span
                        className="block size-2.5 rounded-xs"
                        style={{ background: colors[index] }}
                      />
                      <span className="tabular-nums">{stepLabel(step)}</span>
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="space-y-6">
            <NodeList
              rows={top(stats.by_country, COUNTRY_ROWS).map(([code, count]) => [
                regionName(code),
                count,
              ])}
              title={t('nodesMap.countries')}
            />
            {/* Versions are self-reported by nodes: rendered as React text only. */}
            <NodeList
              rows={top(stats.by_version, VERSION_ROWS)}
              title={t('nodesMap.versions')}
            />
          </div>
        </CardContent>
      ) : (
        <CardContent className="flex min-h-64 p-4">
          <EmptyBox description={t('nodesMap.noData')} icon={<MapIcon />} />
        </CardContent>
      )}
    </Card>
  );
};
