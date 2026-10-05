import dynamic from 'next/dynamic';
import type { Dispatch, SetStateAction } from 'react';
import { useMemo } from 'react';

import Tooltip from '@/components/Atoms/Tooltip';
import JsonView from '@/components/JsonView';
import { yoctoToNear } from '@/libs/convertor';
import { formatNumber } from '@/libs/formatter';
import { isAuroraAction, prettify, shortenString } from '@/libs/txn';
import type { Action as ActionType } from '@/types/near';

const RlpTransaction = dynamic(() => import('./RlpTransaction'), {
  ssr: false,
});

type ActionProps = {
  action: ActionType;
  failed?: boolean;
  open: boolean;
  receiver: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const kind: Record<ActionType['kind'], { bg: string; text: string }> = {
  addKey: {
    bg: 'bg-bg-key-add',
    text: 'Access Key Created',
  },
  createAccount: {
    bg: 'bg-bg-account-add',
    text: 'Account Created',
  },
  delegateAction: {
    bg: 'bg-bg-function',
    text: 'Delegate Action',
  },
  deleteAccount: {
    bg: 'bg-bg-account-delete',
    text: 'Account Deleted',
  },
  deleteKey: {
    bg: 'bg-bg-key-delete',
    text: 'Access Key Deleted',
  },
  deployContract: {
    bg: 'bg-bg-contract',
    text: 'Contract Deployed',
  },
  functionCall: {
    bg: 'bg-bg-function',
    text: '',
  },
  stake: {
    bg: 'bg-bg-stake',
    text: 'Restake',
  },
  transfer: {
    bg: 'bg-bg-transfer',
    text: 'Transfer',
  },
  unknown: {
    bg: 'bg-bg-function',
    text: '',
  },
};

const Action = ({ action, failed, open, receiver, setOpen }: ActionProps) => {
  const method =
    action.kind === 'functionCall'
      ? action.args.methodName
      : action.kind === 'unknown'
        ? action.args.name
        : kind[action.kind].text;

  const raw = action.kind === 'functionCall' ? action.args.args : '';

  const args = useMemo(() => (raw ? prettify(raw) : ''), [raw]);

  return (
    <div>
      <button
        className={`h-7 text-sm text-black rounded py-1 px-3 ${
          kind[action.kind].bg
        }`}
        onClick={() => setOpen((o) => !o)}
      >
        {method.length > 22 ? (
          <Tooltip tooltip={method}>
            {shortenString(method, 10, 10, 22)}
          </Tooltip>
        ) : (
          method
        )}
        <span className="inline-flex items-center justify-center w-3">
          {open ? '-' : '+'}
        </span>
      </button>
      {failed && (
        <span className="ml-2 text-xs text-black rounded px-1 py-0.5 bg-bg-account-delete">
          Fail
        </span>
      )}
      <span className="font-semibold text-xs">
        {action.kind === 'transfer'
          ? `${formatNumber(yoctoToNear(action.args.deposit), 6)} Ⓝ`
          : null}
      </span>
      {open && args && (
        <div className="px-4 py-6">
          {method === 'rlp_execute' || isAuroraAction(method, receiver) ? (
            <RlpTransaction method={method} raw={raw} receiver={receiver} />
          ) : (
            <JsonView>{args}</JsonView>
          )}
        </div>
      )}
    </div>
  );
};

export default Action;
