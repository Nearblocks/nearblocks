'use client';

import { useEffect, useState } from 'react';

import { useTheme } from '@/hooks/use-theme';

// Site colours for ECharts, read from the same CSS variables the Highcharts charts use
// and refreshed when the site theme (light/dark) changes. ECharts needs concrete colours,
// so each variable is resolved to rgb() through a 1x1 canvas (handles oklch()).
export type ChartTheme = {
  border: string;
  card: string;
  foreground: string;
  muted: string;
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
    foreground: read(VARS.foreground),
    muted: read(VARS.muted),
    series: read(VARS.series),
  };
};

export const useChartTheme = (): ChartTheme | null => {
  const mode = useTheme();
  const [theme, setTheme] = useState<ChartTheme | null>(null);

  useEffect(() => {
    setTheme(readTheme());
  }, [mode]);

  return theme;
};
