import { LuCircleCheck, LuCircleX, LuHourglass } from 'react-icons/lu';

import { Badge } from '@/ui/badge';

type Props = {
  status: boolean | undefined;
};

const badgeClass = 'size-5 rounded-full p-1';
const iconClass = 'size-4';

export const TxnStatusIcon = ({ status }: Props) => {
  if (status == null)
    return (
      <Badge className={badgeClass} variant="amber">
        <LuHourglass className={iconClass} />
      </Badge>
    );

  return status ? (
    <Badge className={badgeClass} variant="lime">
      <LuCircleCheck className={iconClass} />
    </Badge>
  ) : (
    <Badge className={badgeClass} variant="red">
      <LuCircleX className={iconClass} />
    </Badge>
  );
};
