// ECharts with only the parts the site uses registered, so bundles stay small.
// Add chart types and components here as charts move over from Highcharts.
import { LineChart, MapChart } from 'echarts/charts';
import {
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  GridComponent,
  LegendPlainComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  GridComponent,
  LegendPlainComponent,
  LineChart,
  MapChart,
  SVGRenderer,
  TooltipComponent,
]);

export { echarts };
