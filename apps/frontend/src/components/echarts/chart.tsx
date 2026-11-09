'use client';

import type { EChartsCoreOption } from 'echarts/core';
import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

import { echarts } from './core';

type Props = {
  className?: string;
  /** Accessible name for the chart. */
  label: string;
  option: EChartsCoreOption;
};

// Thin React wrapper: one ECharts instance per element, resized with its container.
export const EChart = ({ className, label, option }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const instance = echarts.init(ref.current, null, { renderer: 'svg' });
    chart.current = instance;
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      instance.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    chart.current?.setOption(option, { notMerge: true });
  }, [option]);

  return (
    <div
      aria-label={label}
      className={cn('w-full', className)}
      ref={ref}
      role="img"
    />
  );
};
