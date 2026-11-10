'use client';

import { use, useEffect, useMemo, useState } from 'react';

import { EChart } from '@/components/echarts/chart';
import { echarts } from '@/components/echarts/core';
import { useChartTheme } from '@/components/echarts/use-chart-theme';
import {
  nodesMapOption,
  stepColors,
  STEPS,
} from '@/components/nodes/map-option';
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
      // Country name from Intl and a number: nothing node-supplied is rendered.
      tooltip: (code, value) =>
        `<div style="display:flex;gap:16px;justify-content:space-between"><span>${regionName(
          code,
        )}</span><span style="font-variant-numeric:tabular-nums;font-weight:500">${numberFormat(
          value,
        )}</span></div>`,
    });
  }, [codes, regionName, stats, theme]);

  const colors = theme && stepColors(theme);
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
        <div className="lg:col-span-2 lg:self-center">
          {loading || codes === undefined || (codes && !option) ? (
            <Skeleton className="aspect-9/4 w-full" />
          ) : option ? (
            <EChart
              className="aspect-9/4"
              label={t('nodesMap.title')}
              option={option}
            />
          ) : null}
          {!loading && (!stats || codes === null) ? (
            <p className="mt-2 text-body-sm text-muted-foreground">
              {t('nodesMap.noData')}
            </p>
          ) : (
            colors && (
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
            )
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
                  <span className="text-muted-foreground tabular-nums">
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
                  <span className="truncate">{version}</span>
                  <span className="text-muted-foreground tabular-nums">
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
