import { useMemo } from 'react';

import RlpTransaction from '@/components/Transaction/RlpTransaction';
import convertor from '@/libs/convertor';
import formatter from '@/libs/formatter';
import { prettify, shortenString } from '@/libs/utils';

interface TxnActionProps {
  action: {
    args: {
      [key: string]: any;
      args?: string;
      deposit?: string;
      methodName?: string;
    };
    kind: string;
  };
  open: boolean;
  receiver: string;
  setOpen: any;
}

const kind: Record<string, { bg: string; text: string }> = {
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
};

const TxnAction = ({ action, open, receiver, setOpen }: TxnActionProps) => {
  const { yoctoToNear } = convertor();
  const { formatNumber } = formatter();

  const method =
    action.kind === 'functionCall'
      ? action.args.methodName
      : kind[action.kind]?.text || action.kind;

  const args = useMemo(() => {
    if (action.kind === 'functionCall' && action.args.args) {
      return prettify(action.args.args);
    }
    return '';
  }, [action]);

  const modifiedData =
    method === 'submit' && receiver.includes('aurora')
      ? { tx_bytes_b64: action.args.args || args }
      : action.args.args || args;

  return (
    <div>
      <button
        className={`h-7 text-sm text-black rounded py-1 px-3 ${
          kind[action.kind]?.bg || 'bg-gray-200'
        }`}
        onClick={() => setOpen((o: any) => !o)}
      >
        {method && method.length > 22 ? (
          <span title={method}>{shortenString(method, 10, 10, 22)}</span>
        ) : (
          method
        )}
        <span className="inline-flex items-center justify-center w-3 ml-1">
          {open ? '-' : '+'}
        </span>
      </button>
      <span className="font-semibold text-xs ml-2">
        {action.kind === 'transfer' && action.args.deposit
          ? `${formatNumber(yoctoToNear(action.args.deposit), 6)} Ⓝ`
          : null}
      </span>
      {open && args && (
        <div className="px-4 py-6">
          {method === 'rlp_execute' ||
          (method === 'submit' && receiver.includes('aurora')) ? (
            <RlpTransaction
              method={method}
              pretty={modifiedData}
              receiver={receiver}
            />
          ) : (
            <pre className="bg-bg-code p-3 rounded overflow-x-auto text-sm">
              {args}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default TxnAction;
