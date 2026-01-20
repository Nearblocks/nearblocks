'use client';

import { Chart } from '@highcharts/react';
import { Heatmap as HeatmapSeries } from '@highcharts/react/series';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'highcharts/esm/modules/heatmap.src.js';
import { memo, useMemo } from 'react';
type Props = {
  data?: Array<{ date: Date | number | string; value: number }>;
  height?: number;
};

dayjs.extend(isoWeek);

const createDateKey = (date: dayjs.Dayjs) => date.format('YYYY-MM-DD');

export const Heatmap = memo(({ data, height = 176 }: Props) => {
  const { options, points } = useMemo(() => {
    const resolvedData = data ?? [];
    const parsedDates = resolvedData
      .map((item) => dayjs(item.date))
      .filter((date) => date.isValid())
      .sort((a, b) => (a.isAfter(b) ? 1 : -1));

    const valuesByDay = new Map<string, number>();
    const dataValues: number[] = [];

    for (const item of resolvedData) {
      const date = dayjs(item.date);
      if (!date.isValid()) continue;

      const key = createDateKey(date);
      valuesByDay.set(key, item.value);
      dataValues.push(item.value);
    }

    const start = parsedDates.length
      ? parsedDates[0].startOf('month')
      : dayjs().startOf('year');
    const end = parsedDates.length
      ? parsedDates[parsedDates.length - 1].endOf('month')
      : dayjs().endOf('year');

    const maxValue = dataValues.length ? Math.max(...dataValues) : 0;
    const step = Math.max(1, Math.ceil(maxValue / 4));

    const months: dayjs.Dayjs[] = [];
    let currentMonth = start.startOf('month');
    while (currentMonth.isBefore(end) || currentMonth.isSame(end, 'month')) {
      months.push(currentMonth);
      currentMonth = currentMonth.add(1, 'month');
    }

    const monthOffsets: { label: string; startIndex: number; weeks: number }[] =
      [];
    const points: Array<{ date: number; value: number; x: number; y: number }> =
      [];
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
      {
        from: 0,
        // name: 'Less',
        to: 0,
      },
      {
        from: 1,
        // name: '',
        to: Math.min(step, maxValue),
      },
      {
        from: step + 1,
        // name: '',
        to: Math.min(step * 2, maxValue),
      },
      {
        from: step * 2 + 1,
        // name: '',
        to: Math.min(step * 3, maxValue),
      },
      {
        from: step * 3 + 1,
        // name: 'More',
        to: maxValue,
      },
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
                brightness: 0.15,
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
              <span class="text-body-xs fill-foreground">${new Intl.DateTimeFormat(
                'en',
                {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                },
              ).format(point.date)}
              <br/>${point.value} txns</span>
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
    };
  }, [data, height]);

  return (
    <Chart options={options}>
      <HeatmapSeries.Series data={points} />
    </Chart>
  );
});

Heatmap.displayName = 'Heatmap';
