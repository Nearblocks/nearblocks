import { CircleCheck, CircleX, Hourglass } from 'lucide-react';

import { Badge } from '@/ui/badge';

type StatusProps = {
  status: boolean | undefined;
};

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

export const TxnStatus = ({ status }: StatusProps) => {
  if (status == null)
    return (
      <Badge variant="amber">
        <Hourglass className={iconClass} /> Pending
      </Badge>
    );

  return status ? (
    <Badge variant="lime">
      <CircleCheck className={iconClass} /> Success
    </Badge>
  ) : (
    <Badge variant="red">
      <CircleX className={iconClass} /> Failed
    </Badge>
  );
};

export const TxnStatusIcon = ({ status }: StatusIconProps) => {
  if (status == null)
    return (
      <Badge className={statusClass} variant="amber">
        <Hourglass className={iconClass} />
      </Badge>
    );

  return status ? (
    <Badge className={statusClass} variant="lime">
      <CircleCheck className={iconClass} />
    </Badge>
  ) : (
    <Badge className={statusClass} variant="red">
      <CircleX className={iconClass} />
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
