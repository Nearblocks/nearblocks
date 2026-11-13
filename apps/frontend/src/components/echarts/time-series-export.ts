import type { echarts } from './core';

export type ExportAction = 'fullscreen' | 'jpeg' | 'png' | 'print' | 'svg';

// Raster exports are drawn at twice the on-screen size, like Highcharts' scale 2.
const RASTER_SCALE = 2;

const download = (href: string, filename: string) => {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
};

// The SVG renderer always serialises to SVG, so raster formats go via a canvas.
const rasterise = async (
  chart: echarts.ECharts,
  svgUrl: string,
  type: 'jpeg' | 'png',
) => {
  const image = new Image();
  image.src = svgUrl;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = chart.getWidth() * RASTER_SCALE;
  canvas.height = chart.getHeight() * RASTER_SCALE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D context unavailable');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(`image/${type}`);
};

const print = (svgUrl: string) => {
  const frame = document.createElement('iframe');
  frame.className = 'invisible fixed size-0';
  frame.srcdoc = `<img src="${svgUrl}" style="width:100%">`;
  frame.onload = () => {
    frame.contentWindow?.print();
    frame.remove();
  };
  document.body.append(frame);
};

/** Downloads or prints the chart as rendered, background included. */
export const exportChart = async (
  chart: echarts.ECharts,
  action: Exclude<ExportAction, 'fullscreen'>,
  filename: string,
) => {
  const svgUrl = chart.getDataURL({ type: 'svg' });
  if (action === 'print') return print(svgUrl);
  if (action === 'svg') return download(svgUrl, `${filename}.svg`);
  const url = await rasterise(chart, svgUrl, action);
  download(url, `${filename}.${action === 'jpeg' ? 'jpg' : 'png'}`);
};
