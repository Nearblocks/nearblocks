import { LuCircleCheck, LuCircleX, LuHourglass } from 'react-icons/lu';

import { Badge } from '@/ui/badge';

type StatusIconProps = {
  status: boolean | undefined;
};

type DirectionProps = {
  address?: string;
  amount?: string;
  from?: string;
  to?: string;
};

const iconClass = 'size-4';
const statusClass = 'size-5 rounded-full p-1';
const directionClass =
  'inline-block max-w-20 min-w-12.5 truncate text-center align-middle';

export const TxnStatusIcon = ({ status }: StatusIconProps) => {
  if (status == null)
    return (
      <Badge className={statusClass} variant="amber">
        <LuHourglass className={iconClass} />
      </Badge>
    );

  return status ? (
    <Badge className={statusClass} variant="lime">
      <LuCircleCheck className={iconClass} />
    </Badge>
  ) : (
    <Badge className={statusClass} variant="red">
      <LuCircleX className={iconClass} />
    </Badge>
  );
};

const Self = () => (
  <Badge className={directionClass} variant="blue">
    SELF
  </Badge>
);

const In = () => (
  <Badge className={directionClass} variant="lime">
    IN
  </Badge>
);

const Out = () => (
  <Badge className={directionClass} variant="red">
    OUT
  </Badge>
);

export const TxnDirection = ({ address, amount, from, to }: DirectionProps) => {
  if (amount) {
    if (+amount === 0) return <Self />;

    return +amount > 0 ? <In /> : <Out />;
  }

  if (from === to) {
    return <Self />;
  }

  return address === from ? <Out /> : <In />;
};
