import type { TooltipProps } from '@/Atoms/Tooltip';
import type { ConvertorModule } from '@/libs/convertor';
import type { FormatterModule } from '@/libs/formatter';
import type { UtilsModule } from '@/libs/utils';

export type ActionProps = {
  action: Action;
  open: boolean;
  receiver: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

let TxnActionSkeleton = window?.TxnActionSkeleton || (() => <></>);
let JsonView = window?.JsonView || (({ children }) => <pre>{children}</pre>);

const kind = {
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

const prettify = (args: string) => {
  try {
    return JSON.stringify(JSON.parse(atob(args)), undefined, 2);
  } catch (error) {
    return args;
  }
};

const Action = ({ action, open, receiver, setOpen }: ActionProps) => {
  let { yoctoToNear } = VM.require<ConvertorModule>(
    `${config_account}/widget/lite.libs.convertor`,
  );
  let { formatNumber } = VM.require<FormatterModule>(
    `${config_account}/widget/lite.libs.formatter`,
  );
  let { shortenString } = VM.require<UtilsModule>(
    `${config_account}/widget/lite.libs.utils`,
  );

  if (!yoctoToNear || !formatNumber || !shortenString)
    return <TxnActionSkeleton />;

  const method =
    action.kind === 'functionCall'
      ? action.args.methodName
      : kind[action.kind].text;

  const args = useMemo(() => {
    if (action.kind === 'functionCall' && action.args.args) {
      return prettify(action.args.args);
    }

    return '';
  }, [action]);

  const modifiedData =
    method === 'submit' && receiver.includes('aurora')
      ? { tx_bytes_b64: (action.args as any).args || args }
      : (action.args as any).args || args;

  return (
    <div>
      <button
        className={`h-7 text-sm text-black rounded py-1 px-3 ${
          kind[action.kind].bg
        }`}
        onClick={() => setOpen((o) => !o)}
      >
        {method.length > 22 ? (
          <Widget<TooltipProps>
            key="tooltip"
            props={{
              children: shortenString(method, 10, 10, 22),
              tooltip: method,
            }}
            src={`${config_account}/widget/lite.Atoms.Tooltip`}
          />
        ) : (
          method
        )}
        <span className="inline-flex items-center justify-center w-3">
          {open ? '-' : '+'}
        </span>
      </button>
      <span className="font-semibold text-xs">
        {action.kind === 'transfer'
          ? `${formatNumber(yoctoToNear(action.args.deposit), 6)} Ⓝ`
          : null}
      </span>
      {open && args && (
        <div className="px-4 py-6">
          {method === 'rlp_execute' ||
          (method === 'submit' && receiver.includes('aurora')) ? (
            <Widget<any>
              key="rlp_execute"
              loading={<></>}
              props={{
                method: method,
                pretty: modifiedData,
                receiver,
              }}
              src={`${config_account}/widget/lite.Txn.RlpTransaction`}
            />
          ) : (
            <JsonView>{args}</JsonView>
          )}
        </div>
      )}
    </div>
  );
};

export default Action;
