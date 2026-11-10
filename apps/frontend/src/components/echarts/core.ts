// ECharts with only the parts the site uses registered, so bundles stay small.
// Add chart types and components here as charts move over from Highcharts.
import { MapChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([MapChart, SVGRenderer, TooltipComponent]);

export { echarts };
