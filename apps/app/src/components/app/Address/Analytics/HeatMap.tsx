'use client';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import heatmap from 'highcharts/modules/heatmap';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import advancedFormat from 'dayjs/plugin/advancedFormat';

heatmap(Highcharts);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

type ApiDataPoint = {
  date: string;
  txns: string;
};

type TxnsHeatmapProps = {
  data: ApiDataPoint[];
  startDate?: string;
  endDate?: string;
};

type CustomHeatmapPoint = {
  x?: number;
  y?: number;
  value?: number | null;
  dateString?: string;
  rawDate?: string;
};

const TxnsHeatmap = ({ data, startDate, endDate }: TxnsHeatmapProps) => {
  const { theme } = useTheme();
  const [chartOptions, setChartOptions] = useState<Highcharts.Options | null>(
    null,
  );

  const dateRange = useMemo(() => {
    const end = endDate ? dayjs(endDate) : dayjs();
    const start = startDate
      ? dayjs(startDate)
      : end.subtract(12, 'month').startOf('month');
    return { start, end };
  }, [startDate, endDate]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const { start, end } = dateRange;

    const dataMap = new Map(
      data.map((item) => [
        dayjs(item.date).format('YYYY-MM-DD'),
        parseInt(item.txns) || 0,
      ]),
    );

    const months: dayjs.Dayjs[] = [];
    let currentMonth = start.startOf('month');
    while (currentMonth.isBefore(end) || currentMonth.isSame(end, 'month')) {
      months.push(currentMonth);
      currentMonth = currentMonth.add(1, 'month');
    }

    const processedData: CustomHeatmapPoint[] = [];
    const monthCategories: string[] = [];
    let globalWeekIndex = 0;

    months.forEach((month) => {
      const monthStart = month.startOf('month');
      const monthEnd = month.endOf('month');

      const weekStart = monthStart.startOf('isoWeek');

      const weeksInMonth = Math.ceil((monthEnd.diff(weekStart, 'day') + 1) / 7);

      monthCategories.push(month.format('MMM'));

      let currentDate = weekStart.clone();
      for (let week = 0; week < weeksInMonth; week++) {
        for (let day = 0; day < 7; day++) {
          const dateString = currentDate.format('YYYY-MM-DD');
          const isInCurrentMonth = currentDate.isSame(month, 'month');

          if (isInCurrentMonth) {
            const txnCount = dataMap.get(dateString) || 0;
            const dayOfWeek =
              currentDate.day() === 0 ? 6 : currentDate.day() - 1;

            processedData.push({
              x: globalWeekIndex + week,
              y: dayOfWeek,
              value: txnCount > 0 ? txnCount : null,
              dateString: currentDate.format('MMM D, YYYY'),
            });
          }

          currentDate = currentDate.add(1, 'day');
        }
        currentDate = weekStart.add(week + 1, 'week');
      }

      globalWeekIndex += weeksInMonth + 1;
    });

    const dayCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const chartWidth = Math.max(1300, globalWeekIndex * 12);

    const options: Highcharts.Options = {
      chart: {
        type: 'heatmap',
        backgroundColor: 'transparent',
        marginTop: 70,
        marginBottom: 40,
        marginLeft: 50,
        marginRight: 20,
        plotBorderWidth: 0,
        style: { fontFamily: 'inherit' },
        width: chartWidth,
        height: 230,
      },
      title: {
        text: '',
      },
      subtitle: {
        text: '',
      },
      xAxis: {
        categories: [],
        tickLength: 0,
        lineColor: 'transparent',
        labels: {
          enabled: false,
        },
        plotLines: months.map((month, index) => ({
          value:
            index * (Math.ceil(month.daysInMonth() / 7) + 1) +
            Math.ceil(month.daysInMonth() / 7) / 2 -
            0.5,
          width: 0,
          label: {
            text: month.format('MMM'),
            align: 'center',
            y: -10,
            rotation: 0,
            style: {
              color: theme === 'dark' ? '#8b949e' : '#57606a',
              fontSize: '12px',
            },
          },
        })),
      },
      yAxis: {
        categories: dayCategories,
        title: {
          text: null,
        },
        reversed: true,
        tickLength: 0,
        gridLineWidth: 0,
        labels: {
          align: 'right',
          x: -5,
          y: 3,
          style: {
            color: theme === 'dark' ? '#8b949e' : '#57606a',
            fontSize: '11px',
          },
        },
      },
      colorAxis: {
        min: 1,
        stops: [
          [0, '#c6e48b'],
          [0.25, '#7bc96f'],
          [0.5, '#239a3b'],
          [1, '#196127'],
        ],
        labels: { enabled: false },
        minColor: '#c6e48b',
        maxColor: '#196127',
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        formatter: function () {
          const point = this.point as any;
          const dateString = point.dateString;

          if (point.value === null || point.value === undefined) {
            return `No transactions on ${dateString}`;
          }
          return `<b>${point.value.toLocaleString()} transactions</b><br/>${dateString}`;
        },
        backgroundColor:
          theme === 'dark' ? 'rgba(40,40,40,0.95)' : 'rgba(255,255,255,0.95)',
        style: {
          color: theme === 'dark' ? '#FFF' : '#333',
          fontSize: '12px',
        },
        borderWidth: 1,
        borderColor: theme === 'dark' ? '#30363d' : '#d1d9e0',
        borderRadius: 6,
        shadow: false,
      },
      plotOptions: {
        heatmap: {
          borderWidth: 3,
          borderRadius: 5,
          borderColor: theme === 'dark' ? '#0d1117' : '#ffffff',
          nullColor: theme === 'dark' ? '#161b22' : '#ebedf0',
          dataLabels: { enabled: false },
          states: {
            hover: {
              brightness: 0.1,
            },
          },
        },
      },
      series: [
        {
          type: 'heatmap',
          data: processedData,
        },
      ],
      credits: { enabled: false },
    };

    setChartOptions(options);
  }, [theme, data, dateRange]);

  const CustomLegend = () => (
    <div className="flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400 py-2 px-4  ">
      <span>Less</span>
      <div className="w-3 h-3 rounded-sm bg-[#ebedf0] dark:bg-[#161b22] border border-gray-200 dark:border-gray-700"></div>
      <div className="w-3 h-3 rounded-sm bg-[#c6e48b]"></div>
      <div className="w-3 h-3 rounded-sm bg-[#7bc96f]"></div>
      <div className="w-3 h-3 rounded-sm bg-[#239a3b]"></div>
      <div className="w-3 h-3 rounded-sm bg-[#196127]"></div>
      <span>More</span>
    </div>
  );

  return (
    <div className="border dark:border-black-200 rounded-lg my-2 min-h-[300px]">
      <div className="w-full flex justify-between border-b dark:border-b-black-200 py-1">
        <span className="text-sm font-semibold dark:text-neargray-10 text-nearblue-600 py-2 px-4">
          Transaction Heatmap
        </span>
        <span className="text-sm dark:text-neargray-10 text-nearblue-600 py-2 px-4">
          {`${dateRange.start.format('MMM D, YYYY')} - ${dateRange.end.format(
            'MMM D, YYYY',
          )}`}
        </span>
      </div>

      <div className="bg-white dark:bg-black-300 overflow-x-auto">
        <div className="min-w-max min-h-[230px]">
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            containerProps={{ style: { width: '100%', minWidth: '800px' } }}
          />
        </div>
      </div>
      <CustomLegend />
    </div>
  );
};

export default TxnsHeatmap;
