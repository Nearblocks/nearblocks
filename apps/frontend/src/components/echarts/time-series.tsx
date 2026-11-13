'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { EChart } from './chart';
import type { echarts } from './core';
import {
  type RangeKey,
  rangeStart,
  TimeSeriesControls,
} from './time-series-controls';
import { type ExportAction, exportChart } from './time-series-export';
import {
  buildOption,
  defaultFormat,
  type TimeSeries,
  type TimeSeriesFormat,
} from './time-series-option';
import { useChartTheme } from './use-chart-theme';

export type { TimeSeries, TimeSeriesFormat } from './time-series-option';

type Props = {
  className?: string;
  /** Base name of exported files. */
  filename?: string;
  /** Overrides of the compact-number / `MMM D, YYYY` defaults; keep it stable. */
  format?: Partial<TimeSeriesFormat>;
  /** Accessible name of the chart. */
  label: string;
  logScale?: boolean;
  /** Keep the array stable (useMemo); a new one redraws the chart. */
  series: TimeSeries[];
  yAxisName?: string;
};

type Zoom = { end: number; start: number };

type ZoomEvent = { batch?: Zoom[]; end?: number; start?: number };

const FULL: Zoom = { end: 100, start: 0 };

const extent = (series: TimeSeries[]) => {
  const times = series.flatMap(({ data }) =>
    data.length ? [data[0][0], data[data.length - 1][0]] : [],
  );
  return { first: Math.min(...times), last: Math.max(...times) };
};

/**
 * Highcharts Stock-style time-series chart: range buttons, navigator, axis
 * tooltip and export menu. Fills its parent's height, so give it a fixed-height
 * slot that matches the loading skeleton.
 */
export const TimeSeriesChart = ({
  className,
  filename = 'chart',
  format,
  label,
  logScale = false,
  series,
  yAxisName,
}: Props) => {
  const theme = useChartTheme();
  const chart = useRef<echarts.ECharts | null>(null);
  // Zoom window in percent, kept across redraws (log toggle, theme change).
  const zoom = useRef<Zoom>(FULL);
  const dispatching = useRef(false);
  const [range, setRange] = useState<null | RangeKey>('all');
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const { first, last } = useMemo(() => extent(series), [series]);
  const option = useMemo(
    () =>
      theme &&
      buildOption({
        format: { ...defaultFormat, ...format },
        logScale,
        series,
        theme,
        yAxisName,
      }),
    [format, logScale, series, theme, yAxisName],
  );

  const applyZoom = useCallback((next: Zoom) => {
    zoom.current = next;
    dispatching.current = true;
    chart.current?.dispatchAction({ type: 'dataZoom', ...next });
    dispatching.current = false;
  }, []);

  // A redraw resets the zoom; put the user's window back.
  useEffect(() => {
    if (option) applyZoom(zoom.current);
  }, [applyZoom, option]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === root);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [root]);

  const onInit = useCallback((instance: echarts.ECharts) => {
    chart.current = instance;
    instance.on('datazoom', (event) => {
      if (dispatching.current) return;
      const { batch, end, start } = event as ZoomEvent;
      const next = batch?.[0] ?? { end, start };
      zoom.current = { end: next.end ?? 100, start: next.start ?? 0 };
      setRange(null);
    });
  }, []);

  const onRange = (key: RangeKey) => {
    const span = last - first || 1;
    const start = ((rangeStart(key, first, last) - first) / span) * 100;
    applyZoom({ end: 100, start });
    setRange(key);
  };

  const onExport = (action: ExportAction) => {
    if (action === 'fullscreen') {
      const request = fullscreen
        ? document.exitFullscreen()
        : root?.requestFullscreen();
      request?.catch((error) => console.error('Fullscreen failed', error));
      return;
    }
    if (!chart.current) return;
    exportChart(chart.current, action, filename).catch((error) =>
      console.error('Chart export failed', error),
    );
  };

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col gap-4 bg-card p-1',
        fullscreen && 'p-4',
        className,
      )}
      ref={setRoot}
    >
      <TimeSeriesControls
        container={root}
        fullscreen={fullscreen}
        onExport={onExport}
        onRange={onRange}
        range={range}
      />
      {option ? (
        <EChart
          className="min-h-0 flex-1"
          label={label}
          onInit={onInit}
          option={option}
        />
      ) : (
        <div aria-label={label} className="min-h-0 flex-1" role="img" />
      )}
    </div>
  );
};
