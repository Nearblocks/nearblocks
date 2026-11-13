import type { EChartsCoreOption } from 'echarts/core';

import { dateFormat, numberFormat } from '@/lib/format';

import { alpha, type ChartTheme } from './use-chart-theme';

export type TimeSeries = {
  /** `[timestamp ms, value]` pairs, oldest first. */
  data: TimeSeriesPoint[];
  name: string;
  /** Defaults to `line`; `area` adds the fading fill the Highcharts charts use. */
  type?: 'area' | 'line';
};

export type TimeSeriesFormat = {
  /** Y-axis tick labels. */
  axis: (value: number) => string;
  /** Tooltip header, a dayjs format string. */
  date: string;
  /** Tooltip values. */
  value: (value: number) => string;
};

export type TimeSeriesPoint = [number, null | number];

type OptionParams = {
  format: TimeSeriesFormat;
  logScale: boolean;
  series: TimeSeries[];
  theme: ChartTheme;
  yAxisName?: string;
};

type TooltipParam = {
  color: string;
  seriesName: string;
  value: TimeSeriesPoint;
};

const compact = (value: number) => numberFormat(value, { notation: 'compact' });

export const defaultFormat: TimeSeriesFormat = {
  axis: compact,
  date: 'MMM D, YYYY',
  value: compact,
};

// Space under the plot for the x-axis labels, navigator and legend.
const NAVIGATOR_HEIGHT = 40;
const LEGEND_HEIGHT = 24;
const GRID_BOTTOM = NAVIGATOR_HEIGHT + LEGEND_HEIGHT + 40;

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Ticks fall on day/month/year boundaries; label them like Highcharts does.
const axisDate = (value: number) => {
  const date = new Date(value);
  if (date.getUTCDate() !== 1) return dateFormat(value, 'D MMM');
  if (date.getUTCMonth() !== 0) return dateFormat(value, 'MMM YYYY');
  return dateFormat(value, 'YYYY');
};

const tooltipFormatter =
  (format: TimeSeriesFormat) => (params: TooltipParam | TooltipParam[]) => {
    const points = Array.isArray(params) ? params : [params];
    if (!points.length) return '';
    const rows = points
      .filter((point) => point.value[1] !== null)
      .map(
        (point) =>
          `<div><span style="color:${point.color}">●</span> ${escapeHtml(point.seriesName)}: <b>${escapeHtml(format.value(point.value[1]!))}</b></div>`,
      );
    const header = escapeHtml(dateFormat(points[0].value[0], format.date));
    return `<div>${header}</div>${rows.join('')}`;
  };

// A log axis cannot place zero or negative values; drop them like Highcharts.
const positive = (data: TimeSeriesPoint[]): TimeSeriesPoint[] =>
  data.map(([time, value]) => [
    time,
    value !== null && value > 0 ? value : null,
  ]);

const buildSeries = (
  { data, name, type }: TimeSeries,
  color: string,
  logScale: boolean,
) => ({
  areaStyle:
    type === 'area'
      ? {
          color: {
            colorStops: [
              { color: alpha(color, 0.8), offset: 0 },
              { color: alpha(color, 0), offset: 1 },
            ],
            type: 'linear',
            x: 0,
            x2: 0,
            y: 0,
            y2: 1,
          },
        }
      : undefined,
  color,
  data: logScale ? positive(data) : data,
  emphasis: { lineStyle: { width: 3 } },
  lineStyle: { width: 2 },
  name,
  // Thins dense series to the pixel width, like Highcharts' data grouping.
  sampling: 'lttb',
  showSymbol: false,
  type: 'line',
});

export const buildOption = ({
  format,
  logScale,
  series,
  theme,
  yAxisName,
}: OptionParams): EChartsCoreOption => {
  const label = { color: theme.foreground, fontSize: 12 };
  const color = (index: number) =>
    theme.palette[index % theme.palette.length] || theme.series;

  return {
    animationDuration: 500,
    backgroundColor: theme.card,
    dataZoom: [
      {
        filterMode: 'filter',
        moveOnMouseWheel: false,
        type: 'inside',
        zoomOnMouseWheel: 'ctrl',
      },
      {
        backgroundColor: 'transparent',
        borderColor: theme.border,
        bottom: LEGEND_HEIGHT + 8,
        brushSelect: false,
        dataBackground: {
          areaStyle: { color: theme.series, opacity: 0.1 },
          lineStyle: { color: theme.series, opacity: 0.6, width: 1 },
        },
        fillerColor: alpha(theme.series, 0.12),
        handleStyle: { borderColor: theme.muted, color: theme.card },
        height: NAVIGATOR_HEIGHT,
        moveHandleStyle: { color: theme.border, opacity: 1 },
        selectedDataBackground: {
          areaStyle: { color: theme.series, opacity: 0.2 },
          lineStyle: { color: theme.series, width: 1 },
        },
        showDetail: false,
        type: 'slider',
      },
    ],
    grid: { bottom: GRID_BOTTOM, left: 8, right: 16, top: 16 },
    legend: {
      bottom: 0,
      icon: 'roundRect',
      inactiveColor: theme.muted,
      itemHeight: 4,
      itemWidth: 16,
      textStyle: label,
    },
    series: series.map((item, index) =>
      buildSeries(item, color(index), logScale),
    ),
    textStyle: { fontFamily: theme.font },
    tooltip: {
      axisPointer: {
        lineStyle: { color: theme.muted, type: 'solid', width: 1 },
      },
      backgroundColor: theme.card,
      borderWidth: 0,
      confine: true,
      extraCssText:
        'border-radius: 8px; box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);',
      formatter: tooltipFormatter(format),
      padding: [8, 12],
      textStyle: { ...label, fontFamily: theme.font },
      trigger: 'axis',
    },
    useUTC: true,
    xAxis: {
      axisLabel: { ...label, formatter: axisDate, hideOverlap: true },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      type: 'time',
    },
    yAxis: {
      axisLabel: { ...label, formatter: format.axis },
      name: yAxisName,
      nameGap: 16,
      nameLocation: 'middle',
      nameTextStyle: { color: theme.muted, fontSize: 12 },
      splitLine: { lineStyle: { color: alpha(theme.border, 0.6) } },
      type: logScale ? 'log' : 'value',
    },
  };
};
