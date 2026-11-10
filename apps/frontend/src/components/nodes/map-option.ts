import type { ChartTheme } from '@/components/echarts/use-chart-theme';

type Point = number[];

type Options = {
  codes: string[];
  counts: Record<string, number>;
  theme: ChartTheme;
  /** Tooltip HTML for a country; must only contain trusted text. */
  tooltip: (code: string, value: number) => string;
};

// Nodes per country, one colour step each.
export const STEPS = [
  { max: 0, min: 0 },
  { max: 4, min: 1 },
  { max: 19, min: 5 },
  { max: 99, min: 20 },
  { min: 100 },
];

const channels = (color: string) =>
  (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);

const mix = (base: string, tint: string, amount: number) => {
  const [a, b] = [channels(base), channels(tint)];
  if (a.length < 3 || b.length < 3) return base;
  const rgb = a.map((v, i) => Math.round(v + (b[i] - v) * amount));
  return `rgb(${rgb.join(', ')})`;
};

// Countries without nodes get a light tint of the text colour; the rest a ramp of the
// charts' series teal over the card, like the soft area fill on the chart pages.
export const stepColors = ({ card, foreground, series }: ChartTheme) => [
  mix(card, foreground, 0.08),
  ...[0.3, 0.55, 0.8, 1].map((amount) => mix(card, series, amount)),
];

const stepIndex = (value: number) =>
  STEPS.filter((step) => value >= step.min).length - 1;

// Equal Earth (Šavrič, Patterson & Jenny 2018), y pointing down as ECharts expects.
const A1 = 1.340264;
const A2 = -0.081106;
const A3 = 0.000893;
const A4 = 0.003796;
const M = Math.sqrt(3) / 2;
const RAD = Math.PI / 180;

const yOf = (l: number, l2: number, l6: number) =>
  l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2));
const dyOf = (l2: number, l6: number) =>
  A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);

const equalEarth = {
  project: ([lon, lat]: Point) => {
    const l = Math.asin(M * Math.sin(lat * RAD));
    const l2 = l * l;
    const l6 = l2 * l2 * l2;
    return [(lon * RAD * Math.cos(l)) / (M * dyOf(l2, l6)), -yOf(l, l2, l6)];
  },
  unproject: ([x, y]: Point) => {
    let l = -y;
    for (let i = 0; i < 12; i += 1) {
      const l2 = l * l;
      const l6 = l2 * l2 * l2;
      const delta = (yOf(l, l2, l6) + y) / dyOf(l2, l6);
      l -= delta;
      if (Math.abs(delta) < 1e-9) break;
    }
    const l2 = l * l;
    const l6 = l2 * l2 * l2;
    return [
      (M * x * dyOf(l2, l6)) / Math.cos(l) / RAD,
      Math.asin(Math.sin(l) / M) / RAD,
    ];
  },
};

export const nodesMapOption = ({ codes, counts, theme, tooltip }: Options) => {
  const colors = stepColors(theme);
  return {
    series: [
      {
        bottom: 0,
        data: codes.map((code) => {
          const value = counts[code] ?? 0;
          const areaColor = colors[stepIndex(value)];
          // Hover keeps the fill and outlines the country instead.
          return {
            emphasis: { itemStyle: { areaColor } },
            itemStyle: { areaColor },
            name: code,
            value,
          };
        }),
        emphasis: {
          itemStyle: { borderColor: theme.foreground, borderWidth: 1 },
          label: { show: false },
        },
        itemStyle: { borderColor: theme.card, borderWidth: 0.6 },
        left: 0,
        map: 'world',
        projection: equalEarth,
        right: 0,
        roam: false,
        select: { disabled: true },
        selectedMode: false,
        top: 0,
        type: 'map',
      },
    ],
    tooltip: {
      backgroundColor: theme.card,
      // Same look as the Highcharts tooltips: card fill, no border, soft shadow.
      borderWidth: 0,
      confine: true,
      extraCssText:
        'border-radius: 4px; box-shadow: 1px 1px 3px rgb(0 0 0 / 0.15);',
      formatter: (p: { name: string; value?: number }) =>
        tooltip(p.name, p.value ?? 0),
      padding: 8,
      textStyle: {
        color: theme.foreground,
        fontFamily: 'inherit',
        fontSize: 12,
      },
      transitionDuration: 0,
    },
  };
};
