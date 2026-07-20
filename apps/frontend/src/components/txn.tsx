import { CircleCheck, CircleX, Hourglass, MoveRight } from 'lucide-react';

import type { TxnReceipt } from 'nb-schemas';

import { Truncate, TruncateText } from '@/components/truncate';
import { Badge } from '@/ui/badge';
import { Skeleton } from '@/ui/skeleton';

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

type ErrorsProps = {
  receipts?: null | TxnReceipt;
};

const iconClass = 'size-4';
const statusClass = 'size-5 rounded-full p-1';
const directionClass =
  'text-body-xs inline-block max-w-20 min-w-12.5 truncate px-1.5 py-0.5 text-center align-middle';

const pillClass = 'text-body-xs px-1.5 py-0.5';

export const TxnStatus = ({ status }: StatusProps) => {
  if (status == null)
    return (
      <Badge className={pillClass} variant="amber">
        <Hourglass className={iconClass} /> Pending
      </Badge>
    );

  return status ? (
    <Badge className={pillClass} variant="lime">
      <CircleCheck className={iconClass} /> Success
    </Badge>
  ) : (
    <Badge className={pillClass} variant="red">
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

export const TxnDirectionIcon = () => (
  <div className="bg-teal-background mx-auto flex size-5 items-center justify-center rounded-full">
    <MoveRight className="text-teal-foreground size-3" />
  </div>
);

export const TxnDirectionSkeleton = () => (
  <Skeleton className="mx-auto flex size-5 rounded-full" />
);

export const MethodBadge = ({
  text,
  textClassName,
}: {
  text: null | string | undefined;
  textClassName?: string;
}) => (
  <Badge className="text-body-xs max-w-full px-1.5 py-0.5" variant="teal">
    <Truncate>
      <TruncateText
        as="code"
        className={textClassName ?? 'max-w-20'}
        text={text ?? ''}
      />
    </Truncate>
  </Badge>
);

const countFailedReceipts = (receipt: TxnReceipt): number => {
  let count = receipt.outcome?.status === false ? 1 : 0;
  for (const child of receipt.receipts ?? []) {
    count += countFailedReceipts(child);
  }
  return count;
};

const extractErrorKind = (value: unknown): null | string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const key = Object.keys(obj)[0];
    if (!key) return null;
    return extractErrorKind(obj[key]) ?? key;
  }
  return null;
};

const extractError = (result: unknown): null | string => {
  if (!result || typeof result !== 'object' || Array.isArray(result))
    return null;
  const r = result as Record<string, unknown>;
  const actionError = r['ActionError'];
  if (
    !actionError ||
    typeof actionError !== 'object' ||
    Array.isArray(actionError)
  )
    return null;
  const kind = (actionError as Record<string, unknown>)['kind'];
  return extractErrorKind(kind);
};

export const TxnReceiptErrors = ({ receipts }: ErrorsProps) => {
  if (!receipts) return null;

  const failed = countFailedReceipts(receipts);
  if (failed === 0) return null;

  const isTxnFailed = receipts.outcome?.status === false;
  const error = isTxnFailed ? extractError(receipts.outcome?.result) : null;

  return (
    <>
      {!isTxnFailed && (
        <Badge className={pillClass} variant="red">
          {failed} Failed Receipt{failed > 1 ? 's' : ''}
        </Badge>
      )}
      {error && (
        <Badge className={pillClass} variant="amber">
          {error}
        </Badge>
      )}
    </>
  );
};
