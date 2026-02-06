'use client';

import { Chart } from '@highcharts/react';
import { Heatmap as HeatmapSeries } from '@highcharts/react/series';
import 'highcharts/esm/modules/heatmap.src.js';
import { memo, useMemo } from 'react';

import { Dayjs } from '@/lib/dayjs';
import { dateFormat, numberFormat } from '@/lib/format';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip';

type Props = {
  data?: Array<{
    date: Date | number | string;
    txns?: number | string;
  }>;
  height?: number;
};

type Offset = { label: string; startIndex: number; weeks: number };
type Point = { date: number; value: number; x: number; y: number };

const createDateKey = (date: Dayjs.Dayjs) => date.format('YYYY-MM-DD');

const colors = [
  'bg-(--highcharts-color-0)',
  'bg-(--highcharts-color-1)',
  'bg-(--highcharts-color-2)',
  'bg-(--highcharts-color-3)',
  'bg-(--highcharts-color-4)',
];

export const Heatmap = memo(({ data, height = 184 }: Props) => {
  const { options, points, ranges } = useMemo(() => {
    const reversed = (data ?? []).toReversed();
    const valuesByDay = new Map<string, number>();
    const dataValues: number[] = [];

    for (const item of reversed) {
      const date = Dayjs.utc(item.date);
      if (!date.isValid()) continue;

      const key = createDateKey(date);
      const rawValue = item.txns ?? 0;
      const parsedValue =
        typeof rawValue === 'number' ? rawValue : Number(rawValue);
      const value = Number.isFinite(parsedValue) ? parsedValue : 0;

      valuesByDay.set(key, value);
      dataValues.push(value);
    }

    const end = Dayjs.utc().endOf('month');
    const start = end.subtract(11, 'month').startOf('month');

    const maxValue = dataValues.length ? Math.max(...dataValues) : 0;
    const step = Math.max(1, Math.ceil(maxValue / 4));

    const months: Dayjs.Dayjs[] = [];
    let currentMonth = start.startOf('month');
    while (currentMonth.isBefore(end) || currentMonth.isSame(end, 'month')) {
      months.push(currentMonth);
      currentMonth = currentMonth.add(1, 'month');
    }

    const monthOffsets: Offset[] = [];
    const points: Point[] = [];
    let globalWeekIndex = 0;

    months.forEach((month) => {
      const monthStart = month.startOf('month');
      const monthEnd = month.endOf('month');
      const weekStart = monthStart.startOf('isoWeek');
      const weekEnd = monthEnd.endOf('isoWeek');
      const weeksInMonth = weekEnd.diff(weekStart, 'week') + 1;

      monthOffsets.push({
        label: month.format('MMM'),
        startIndex: globalWeekIndex,
        weeks: weeksInMonth,
      });

      let currentDate = weekStart.clone();
      for (let week = 0; week < weeksInMonth; week += 1) {
        for (let day = 0; day < 7; day += 1) {
          if (currentDate.isSame(month, 'month')) {
            const value = valuesByDay.get(createDateKey(currentDate)) ?? 0;
            const dayOfWeek = currentDate.isoWeekday() - 1;

            points.push({
              date: currentDate.valueOf(),
              value,
              x: globalWeekIndex + week,
              y: dayOfWeek,
            });
          }

          currentDate = currentDate.add(1, 'day');
        }
        currentDate = weekStart.add(week + 1, 'week');
      }

      globalWeekIndex += weeksInMonth + 1;
    });

    const monthLabels = new Map<number, string>();
    const xAxisTicks = monthOffsets.map((month) => {
      const tick = month.startIndex + (month.weeks - 1) / 2;
      monthLabels.set(tick, month.label);
      return tick;
    });
    const dayNames = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
    const chartWidth = Math.max(1300, globalWeekIndex * 12);
    const dataClasses = [
      { from: 0, to: 0 },
      { from: 1, to: Math.min(step, maxValue) },
      { from: step + 1, to: Math.min(step * 2, maxValue) },
      { from: step * 2 + 1, to: Math.min(step * 3, maxValue) },
      { from: step * 3 + 1, to: maxValue },
    ].filter((range) => range.from <= range.to);

    return {
      options: {
        chart: {
          backgroundColor: 'transparent',
          height,
          spacingBottom: 18,
          spacingLeft: 0,
          spacingRight: 0,
          spacingTop: 8,
          styledMode: true,
          width: chartWidth,
        },
        colorAxis: {
          dataClassColor: 'category' as const,
          dataClasses,
          min: 0,
        },
        credits: { enabled: false },
        exporting: { enabled: false },
        legend: {
          enabled: false,
        },
        plotOptions: {
          heatmap: {
            borderRadius: 4,
            borderWidth: 3,
            dataLabels: { enabled: false },
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
        title: { text: undefined },
        tooltip: {
          formatter: function () {
            const point = (
              this as unknown as { point: { date: number; value: number } }
            ).point;

            return `
              <span class="text-body-xs fill-foreground">${dateFormat(
                point.date,
                'ddd DD, MMM YYYY',
              )}
              <br/>${numberFormat(point.value)} txns</span>
            `;
          },
        },
        xAxis: {
          className: 'stroke-0',
          labels: {
            formatter: function () {
              const value = (this as unknown as { value: number }).value;
              return monthLabels.get(value) ?? '';
            },
          },
          tickPositions: xAxisTicks,
        },
        yAxis: {
          categories: dayNames,
          className: 'stroke-0',
          gridLineWidth: 0,
          labels: {
            align: 'right' as const,
          },
          reversed: true,
          title: {
            text: undefined,
          },
        },
      },
      points,
      ranges: dataClasses,
    };
  }, [data, height]);

  return (
    <div className="heatmap-chart">
      <Chart options={options}>
        <HeatmapSeries.Series data={points} />
      </Chart>
      <div className="text-body-xs text-muted-foreground flex items-center justify-end gap-1">
        <div className="mr-2">Less</div>
        {ranges.map((range, index) => (
          <Tooltip key={range.from}>
            <TooltipTrigger>
              <span className={`${colors[index]} block h-3 w-3 rounded-xs`} />
            </TooltipTrigger>
            <TooltipContent>
              {range.from
                ? `${numberFormat(range.from)} - ${numberFormat(range.to)}`
                : '0'}
            </TooltipContent>
          </Tooltip>
        ))}
        <div className="ml-2">More</div>
      </div>
    </div>
  );
});

Heatmap.displayName = 'Heatmap';
