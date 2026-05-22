import { ArrowUpRight } from 'lucide-react';
import { ReactNode } from 'react';

import { Link } from '@/components/link';
import { SkeletonSlot } from '@/components/skeleton';
import { Card } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

type Props = {
  href?: string;
  label: ReactNode;
  loading?: boolean;
  skeletonIcon?: boolean;
  skeletonWidth?: string;
  value: ReactNode;
};

const StatBody = ({
  href,
  label,
  loading,
  skeletonIcon,
  skeletonWidth = 'w-24',
  value,
}: Props) => (
  <Card
    className={
      href
        ? 'group relative h-full px-4 py-3 transition-colors'
        : 'h-full px-4 py-3'
    }
  >
    <p className="text-body-xs text-muted-foreground truncate uppercase">
      {label}
    </p>
    {href && (
      <ArrowUpRight className="text-muted-foreground group-hover:text-primary absolute top-3 right-3 size-4 opacity-0 transition-opacity group-hover:opacity-100" />
    )}
    <p className="text-body-lg text-foreground mt-1 flex min-h-7 items-center gap-1">
      <SkeletonSlot
        fallback={
          <>
            {skeletonIcon && <Skeleton className="size-4 rounded-full" />}
            <Skeleton className={`h-5 ${skeletonWidth}`} />
          </>
        }
        loading={!!loading}
      >
        {() => <>{value}</>}
      </SkeletonSlot>
    </p>
  </Card>
);

export const StatCard = (props: Props) => {
  if (props.href) {
    return (
      <Link className="block" href={props.href}>
        <StatBody {...props} />
      </Link>
    );
  }
  return <StatBody {...props} />;
};
