import { Badge } from '@/ui/badge';

type Props = {
  address?: string;
  amount?: string;
  from?: string;
  to?: string;
};

const className = 'inline-block max-w-20 min-w-12.5 truncate text-center';

const Self = () => (
  <Badge className={className} variant="blue">
    SELF
  </Badge>
);

const In = () => (
  <Badge className={className} variant="lime">
    IN
  </Badge>
);

const Out = () => (
  <Badge className={className} variant="red">
    OUT
  </Badge>
);

export const Direction = ({ address, amount, from, to }: Props) => {
  if (amount) {
    if (+amount === 0) return <Self />;

    return +amount > 0 ? <In /> : <Out />;
  }

  if (from === to) {
    return <Self />;
  }

  return address === from ? <In /> : <Out />;
};
