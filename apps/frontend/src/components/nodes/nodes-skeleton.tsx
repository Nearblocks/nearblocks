import { Card, CardContent, CardHeader } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

// Placeholders shaped like the loaded card (same text sizes, line heights, map
// aspect and row counts) so nothing shifts when the data arrives. Line wraps each
// Skeleton in an inline box so flex rows keep the text line height.

export const COUNTRY_ROWS = 8;
export const VERSION_ROWS = 6;

const LEGEND_STEPS = 5;

const Line = ({ className }: { className: string }) => (
  <span>
    <Skeleton className={className} />
  </span>
);

export const MapSkeleton = () => (
  <>
    <Skeleton className="block aspect-9/4 h-auto w-full rounded-lg" />
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-xs">
      <Line className="w-24" />
      {Array.from({ length: LEGEND_STEPS }, (_, i) => (
        <Line className="w-10" key={i} />
      ))}
    </div>
  </>
);

const ListSkeleton = ({ rows }: { rows: number }) => (
  <section>
    <h3 className="mb-2 text-body-xs">
      <Skeleton className="w-24" />
    </h3>
    <ul className="space-y-1 text-body-sm">
      {Array.from({ length: rows }, (_, i) => (
        <li className="flex justify-between gap-2" key={i}>
          <Line className={i % 2 ? 'w-24' : 'w-32'} />
          <Line className="w-6" />
        </li>
      ))}
    </ul>
  </section>
);

export const NodesMapSkeleton = () => (
  <Card>
    <CardHeader className="flex-wrap gap-2 border-b">
      <p className="w-full max-w-xl text-body-sm">
        <Skeleton className="w-full" />
      </p>
      <span className="text-body-xs">
        <Skeleton className="w-40" />
      </span>
    </CardHeader>
    <CardContent className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-3">
      <div className="lg:col-span-2 lg:self-center">
        <MapSkeleton />
      </div>
      <div className="space-y-6">
        <ListSkeleton rows={COUNTRY_ROWS} />
        <ListSkeleton rows={VERSION_ROWS} />
      </div>
    </CardContent>
  </Card>
);
