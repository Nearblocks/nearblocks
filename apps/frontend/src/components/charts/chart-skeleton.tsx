import { Skeleton } from '@/ui/skeleton';

// A chart-shaped placeholder for the h-140 detail chart slot. Mirrors the
// AnalyticsChart layout — range-selector chips, y-axis ticks, plot silhouette,
// x-axis ticks, navigator strip — so the loading state reads as "a chart is
// coming" instead of one flat block, and swaps in without shifting the page.

// Static area silhouette (viewBox stretched to fill the plot). A gently rising
// wave so the placeholder looks like real time-series data.
const TOP_POINTS = [
  [0, 72],
  [6, 68],
  [12, 74],
  [18, 60],
  [24, 64],
  [30, 50],
  [36, 55],
  [42, 42],
  [48, 47],
  [54, 35],
  [60, 40],
  [66, 28],
  [72, 33],
  [78, 22],
  [84, 26],
  [90, 16],
  [96, 20],
  [100, 14],
];

const linePath = TOP_POINTS.map(
  ([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`,
).join(' ');
const areaPath = `${linePath} L100,100 L0,100 Z`;

const GRID_LINES = [20, 40, 60, 80];

export const ChartSkeleton = () => (
  <div className="flex h-full w-full flex-col gap-4 p-1">
    {/* Range-selector chips, right-aligned like the real control */}
    <div className="flex justify-end gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton className="h-7 w-9 rounded-lg" key={i} />
      ))}
    </div>

    {/* Plot region: y-axis tick labels + silhouette */}
    <div className="flex min-h-0 flex-1 gap-3">
      <div className="flex flex-col justify-between py-1">
        {[10, 8, 9, 7, 8, 6].map((w, i) => (
          <Skeleton
            className="rounded"
            key={i}
            style={{ width: `${w * 4}px` }}
          />
        ))}
      </div>
      <div className="relative flex-1">
        <svg
          aria-hidden
          className="text-accent animate-pulse"
          height="100%"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          width="100%"
        >
          {GRID_LINES.map((y) => (
            <line
              className="stroke-current opacity-30"
              key={y}
              strokeDasharray="2 2"
              strokeWidth={0.4}
              x1={0}
              x2={100}
              y1={y}
              y2={y}
            />
          ))}
          <path className="fill-current opacity-40" d={areaPath} />
          <path
            className="stroke-current opacity-70"
            d={linePath}
            fill="none"
            strokeWidth={0.8}
          />
        </svg>
      </div>
    </div>

    {/* X-axis tick labels */}
    <div className="flex justify-between pl-8">
      {[9, 8, 9, 8, 9, 8].map((w, i) => (
        <Skeleton className="rounded" key={i} style={{ width: `${w * 4}px` }} />
      ))}
    </div>

    {/* Navigator strip */}
    <Skeleton className="h-10 w-full rounded" />
  </div>
);
