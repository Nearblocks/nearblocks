import Tooltip from '@/components/Atoms/Tooltip';
import Check from '@/components/Icons/Check';
import Close from '@/components/Icons/Close';
import Time from '@/components/Icons/Time';
import Skeleton from '@/components/Skeleton';
import {
  getErrorMessage,
  getFailedReceipts,
  getTxnState,
  type TxnState,
} from '@/libs/txn';
import type { FinalExecutionOutcomeWithReceiptView } from '@/types/near';

type StatusPillProps = {
  state: TxnState;
};

type StatusProps = {
  data: FinalExecutionOutcomeWithReceiptView | null;
};

const pill =
  'inline-flex items-center gap-1 h-7 text-sm text-black rounded px-3';

const states = {
  failed: { bg: 'bg-bg-account-delete', icon: Close, text: 'Failed' },
  pending: { bg: 'bg-bg-contract', icon: Time, text: 'Pending' },
  success: { bg: 'bg-bg-transfer', icon: Check, text: 'Success' },
};

export const StatusPill = ({ state }: StatusPillProps) => {
  const { bg, icon: Icon, text } = states[state];

  return (
    <span className={`${pill} ${bg}`}>
      <Icon className="w-3.5" />
      {text}
    </span>
  );
};

const Status = ({ data }: StatusProps) => {
  if (!data) {
    return (
      <Skeleton className="block h-7 w-24" loading>
        <span className={`${pill} bg-bg-function`}>&nbsp;</span>
      </Skeleton>
    );
  }

  const state = getTxnState(data.status);
  const failedReceipts = getFailedReceipts(data.receipts_outcome);
  const error = state === 'failed' ? getErrorMessage(data.status) : undefined;

  return (
    <>
      <StatusPill state={state} />
      {state !== 'failed' && failedReceipts > 0 && (
        <span className={`${pill} bg-bg-account-delete`}>
          {failedReceipts} Failed Receipt{failedReceipts > 1 ? 's' : ''}
        </span>
      )}
      {error && (
        <span className={`${pill} bg-bg-contract`}>
          <Tooltip tooltip={error}>
            <span className="block max-w-[260px] truncate">{error}</span>
          </Tooltip>
        </span>
      )}
    </>
  );
};

export default Status;
