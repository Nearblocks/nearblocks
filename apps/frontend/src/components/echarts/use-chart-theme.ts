'use client';

import { useEffect, useState } from 'react';

import { useTheme } from '@/hooks/use-theme';

// Site colours for ECharts, read from the same CSS variables the Highcharts charts use
// and refreshed when the site theme (light/dark) changes. ECharts needs concrete colours,
// so each variable is resolved to rgb() through a 1x1 canvas (handles oklch()).
export type ChartTheme = {
  border: string;
  card: string;
  /** Body font, so chart text matches the page. */
  font: string;
  foreground: string;
  muted: string;
  /** Series colours `--highcharts-color-0..15`, in order. */
  palette: string[];
  /** Primary series colour of the Highcharts charts (brand teal). */
  series: string;
};

const VARS = {
  border: '--border',
  card: '--card',
  foreground: '--foreground',
  muted: '--muted-foreground',
  series: '--highcharts-color-0',
} as const;

const PALETTE_SIZE = 16;

let canvas: CanvasRenderingContext2D | null = null;

const toRgb = (value: string): string => {
  canvas ??= document.createElement('canvas').getContext('2d', {
    willReadFrequently: true,
  });
  if (!canvas || !value) return value;
  canvas.clearRect(0, 0, 1, 1);
  // An invalid value is ignored by the canvas, so start from a known colour.
  canvas.fillStyle = '#000';
  canvas.fillStyle = value;
  canvas.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = canvas.getImageData(0, 0, 1, 1).data;
  return a === 255
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${a / 255})`;
};

const readTheme = (): ChartTheme => {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => toRgb(style.getPropertyValue(name).trim());
  return {
    border: read(VARS.border),
    card: read(VARS.card),
    // ECharts writes this into SVG style attributes unescaped.
    font: `${getComputedStyle(document.body).fontFamily.replaceAll('"', "'")}, sans-serif`,
    foreground: read(VARS.foreground),
    muted: read(VARS.muted),
    palette: Array.from({ length: PALETTE_SIZE }, (_, i) =>
      read(`--highcharts-color-${i}`),
    ),
    series: read(VARS.series),
  };
};

/** `color` (an rgb()/rgba() string from the theme) at the given opacity. */
export const alpha = (color: string, opacity: number): string => {
  const [r, g, b] = color.match(/[\d.]+/g) ?? [];
  return r === undefined ? color : `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const useChartTheme = (): ChartTheme | null => {
  const mode = useTheme();
  const [theme, setTheme] = useState<ChartTheme | null>(null);

  useEffect(() => {
    setTheme(readTheme());
  }, [mode]);

  return theme;
};
