import classNames from 'classnames';
import Cookies from 'js-cookie';
import {
  CandlestickData,
  createChart,
  HistogramData,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
} from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

import { makeApiRequest } from '@/utils/app/helpers';

import ArrowDown from '../Icons/ArrowDown';
import Check from '../Icons/Check';

type Timeframe = '1d' | '1h' | '1m';

const getInterval = (resolution: string) => {
  let interval;

  switch (resolution) {
    case '1m':
      interval = '1m';
      break;
    case '1h':
      interval = '1h';
      break;
    case '1d':
      interval = '1d';
      break;
    default:
      interval = '1m';
      break;
  }

  return interval;
};

const LightweightChart: React.FC = () => {
  const timeframes: Timeframe[] = ['1m', '1h', '1d'];
  const chartOptions = ['Price', 'Token Price', 'Volume'];
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1m');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [selectedChartOption, setSelectedChartOption] = useState(
    chartOptions[0],
  );
  const [tooltip, setTooltip] = useState<any>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const pairs = Cookies?.get('pairs');
  const theme = Cookies?.get('theme');

  interface FetchCandlestickDataParams {
    pairs: string;
    resolution: string;
    selectedChartOption: string;
  }

  const fetchCandlestickData = async ({
    pairs,
    resolution,
    selectedChartOption,
  }: FetchCandlestickDataParams): Promise<{
    candlesticks: CandlestickData[];
    volumes: HistogramData[];
  }> => {
    const to = Math.floor(Date.now() / 1000);
    const interval = getInterval(resolution);

    const urlParameters: Record<string, number | string> = {
      interval,
      limit: 1500,
      to,
    };

    const query = Object.entries(urlParameters)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    try {
      const data = await makeApiRequest(`dex/pairs/${pairs}/charts?${query}`);
      if (!data?.charts?.length) {
        console.warn('No data available for the selected period.');
        return { candlesticks: [], volumes: [] };
      }

      const candlesticks: CandlestickData[] = [];
      const volumes: HistogramData[] = [];

      data.charts.forEach((bar: any) => {
        const time = bar.timestamp;

        // Candlestick data
        if (selectedChartOption === 'Price') {
          candlesticks.push({
            close: parseFloat(bar.close),
            high: parseFloat(bar.high),
            low: parseFloat(bar.low),
            open: parseFloat(bar.open),
            time,
          });
        } else if (selectedChartOption === 'Token Price') {
          candlesticks.push({
            close: parseFloat(bar.close_token),
            high: parseFloat(bar.high_token),
            low: parseFloat(bar.low_token),
            open: parseFloat(bar.open_token),
            time,
          });
        }

        // Volume data
        volumes.push({
          color: bar.close > bar.open ? '#26a69a' : '#ef5350',
          time,
          value: parseFloat(bar.volume),
        });
      });

      return { candlesticks, volumes };
    } catch (error) {
      console.error('Failed to fetch candlestick data:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === 'dark';

    // Destroy the current chart if it exists
    chartRef.current?.remove();

    // Create a new chart with the updated theme
    chartRef.current = createChart(chartContainerRef.current, {
      grid: {
        horzLines: { color: isDark ? '#444' : '#eee', style: 2 },
        vertLines: { color: isDark ? '#444' : '#eee', style: 2 },
      },
      handleScroll: { pressedMouseMove: false },
      height: 300,
      layout: {
        background: { color: isDark ? '#000' : 'white' },
        textColor: isDark ? '#ddd' : '#333',
      },
      timeScale: {
        borderColor: isDark ? '#555' : '#cccccc',
      },
      width: chartContainerRef.current.clientWidth,
    });

    candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
      borderVisible: false,
      downColor: '#ef5350',
      upColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });

    volumeSeriesRef.current = chartRef.current.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    chartRef.current.timeScale().fitContent();

    return () => {
      chartRef.current?.remove();
    };
  }, [theme]);

  useEffect(() => {
    const updateChart = async () => {
      if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

      const { candlesticks, volumes } = await fetchCandlestickData({
        pairs: pairs as string,
        resolution: selectedTimeframe,
        selectedChartOption,
      });

      if (
        selectedChartOption === 'Price' ||
        selectedChartOption === 'Token Price'
      ) {
        candlestickSeriesRef.current.setData(candlesticks);
        candlestickSeriesRef.current.applyOptions({ visible: true });
        volumeSeriesRef.current.applyOptions({ visible: false });
        setCurrentPrice(candlesticks?.[candlesticks.length - 1]?.close || null);
      } else if (selectedChartOption === 'Volume') {
        volumeSeriesRef.current.setData(volumes);
        volumeSeriesRef.current.applyOptions({ visible: true });
        candlestickSeriesRef.current.applyOptions({ visible: false });
        setCurrentPrice(volumes?.[volumes.length - 1]?.value || null);
      }

      chartRef.current?.timeScale().fitContent();
    };

    updateChart();
  }, [selectedTimeframe, selectedChartOption]);

  useEffect(() => {
    const handleMouseMove = (param: MouseEventParams) => {
      if (param.time) {
        const seriesData = candlestickSeriesRef.current?.data();
        const priceData = seriesData?.find(
          (data: any) => data.time === param.time,
        );

        if (priceData) {
          const { close, high, low, open } = priceData as CandlestickData;
          setTooltip(
            <>
              <div>Open: {open}</div>
              <div>High: {high}</div>
              <div>Low: {low}</div>
              <div>Close: {close}</div>
            </>,
          );
          setCurrentPrice(close);
        }
      } else {
        setTooltip(null);
        const seriesData = candlestickSeriesRef.current?.data();
        if (seriesData && seriesData?.length > 0) {
          const latestCandle: any = seriesData[seriesData.length - 1];
          if (latestCandle && latestCandle?.close !== undefined) {
            setCurrentPrice(latestCandle?.close);
          }
        }
      }
    };

    const handleTooltipPosition = (event: MouseEvent) => {
      if (!tooltipRef.current || !chartContainerRef.current) return;

      const chartRect = chartContainerRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current.offsetWidth;
      const tooltipHeight = tooltipRef.current.offsetHeight;

      let x = event.clientX - chartRect.left;
      let y = event.clientY - chartRect.top;

      // Ensure the tooltip stays within the chart's boundaries
      x = Math.min(chartRect.width - tooltipWidth, Math.max(0, x));
      y = Math.min(chartRect.height - tooltipHeight, Math.max(0, y));

      tooltipRef.current.style.left = `${x}px`;
      tooltipRef.current.style.top = `${y}px`;
    };

    chartRef.current?.subscribeCrosshairMove(handleMouseMove);

    const chartContainer = chartContainerRef.current;
    if (chartContainer) {
      chartContainer.addEventListener('mousemove', handleTooltipPosition);
    }

    return () => {
      chartRef.current?.unsubscribeCrosshairMove(handleMouseMove);
      if (chartContainer) {
        chartContainer.removeEventListener('mousemove', handleTooltipPosition);
      }
    };
  }, []);

  const handleChartOptionChange = (value: string) => {
    setSelectedChartOption(value);
    setIsDropdownOpen(false);

    if (value === 'Volume') {
      volumeSeriesRef.current?.applyOptions({
        visible: true,
      });
    } else {
      volumeSeriesRef.current?.applyOptions({
        visible: false,
      });
    }
  };

  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 focus:outline-none rounded-lg',
      {
        'bg-green-600 dark:bg-green-250 text-white': selected,
        'hover:bg-neargray-800 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
      },
    );

  return (
    <div className="h-[385px] items-center justify-between">
      <div className="relative h-[300px]" ref={chartContainerRef}>
        {/* Heading */}
        <div className="absolute top-1.5 bottom-5 left-2.5 z-50">
          <span className="text-3xl font-bold">
            {currentPrice !== null ? `$${currentPrice.toFixed(2)}` : ''}
          </span>
        </div>
        {/* Tooltip */}
        {tooltip && selectedChartOption !== 'Volume' && (
          <div
            className="absolute bg-gray-800 text-white px-3 py-1 rounded shadow-md pointer-events-none text-xs items-center"
            ref={tooltipRef}
            style={{ position: 'absolute', zIndex: 1000 }}
          >
            {tooltip}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center gap-4 mt-4">
        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 border p-2 rounded-lg text-nearblue-600">
          {timeframes.map((timeframe) => (
            <button
              className={`h-8 px-2 rounded-md ${getClassName(
                selectedTimeframe === timeframe,
              )}`}
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe}
            </button>
          ))}
        </div>

        {/* Price Selector */}
        <div className="flex items-center">
          <li className="relative group flex h-10 justify-end max-md:mb-2">
            <span className="border rounded-md bg-white dark:bg-black-200 text-nearblue-600 dark:text-neargray-10 hover:text-green-500 dark:hover:text-green-250 flex items-center">
              <button
                className={`h-10 w-36 text-left pl-3 pr-6 truncate cursor-pointer focus:outline-none appearance-none`}
                onClick={toggleDropdown}
              >
                {selectedChartOption}
              </button>
              <ArrowDown className="absolute right-2.5 top-2 w-4 h-4 fill-current pointer-events-none" />
            </span>
            {isDropdownOpen && (
              <div className="absolute py-1 z-10 left-0 top-full">
                <ul className="w-36 bg-white dark:bg-black-600 border border-gray-300 dark:border-black-200 rounded-md soft-shadow">
                  {chartOptions.map((option) => (
                    <li
                      className={`flex justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-black-500 hover:text-green-400 dark:hover:text-green-250 dark:text-neargray-10 ${
                        option === selectedChartOption
                          ? 'bg-gray-100 dark:bg-black-500 text-green-500 dark:!text-green-250'
                          : ''
                      }`}
                      key={option}
                      onClick={() => handleChartOptionChange(option)}
                    >
                      <span>{option}</span>
                      {option === selectedChartOption && (
                        <Check className="w-3 mr-2 text-green-500 dark:text-green-250" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        </div>
      </div>
    </div>
  );
};

export default LightweightChart;
