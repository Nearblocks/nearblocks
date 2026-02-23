import { CircleCheck, CircleX, Hourglass, MoveRight } from 'lucide-react';

import type { TxnReceipt } from 'nb-schemas';

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

type ErrorsProps = {
  receipts?: null | TxnReceipt;
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

export const TxnDirectionIcon = () => (
  <div className="bg-teal-background flex size-6 items-center justify-center rounded-full">
    <MoveRight className="text-teal-foreground size-4" />
  </div>
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
        <Badge className="text-body-xs" variant="red">
          {failed} Failed Receipt{failed > 1 ? 's' : ''}
        </Badge>
      )}
      {error && (
        <Badge className="text-body-xs" variant="amber">
          {error}
        </Badge>
      )}
    </>
  );
};
