import type { TooltipProps } from '@/Atoms/Tooltip';
import type { ConvertorModule } from '@/libs/convertor';
import type { FormatterModule } from '@/libs/formatter';
import type { UtilsModule } from '@/libs/utils';

export type ActionProps = {
  action: Action;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

let TxnActionSkeleton = window?.TxnActionSkeleton || (() => <></>);
let JsonView = window?.JsonView || (({ children }) => <pre>{children}</pre>);

const kind = {
  addKey: {
    bg: 'bg-addKey',
    text: 'Access Key Created',
  },
  createAccount: {
    bg: 'bg-createAccount',
    text: 'Account Created',
  },
  delegateAction: {
    bg: 'bg-functionCall',
    text: 'Delegate Action',
  },
  deleteAccount: {
    bg: 'bg-deleteAccount',
    text: 'Account Deleted',
  },
  deleteKey: {
    bg: 'bg-deleteKey',
    text: 'Access Key Deleted',
  },
  deployContract: {
    bg: 'bg-deployContract',
    text: 'Contract Deployed',
  },
  functionCall: {
    bg: 'bg-functionCall',
    text: '',
  },
  stake: {
    bg: 'bg-stake',
    text: 'Restake',
  },
  transfer: {
    bg: 'bg-transfer',
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
const Container = styled.div`
  .bg-addKey {
    background-color: rgb(var(--color-bg-key-add));
  }
  .bg-createAccount {
    background-color: rgb(var(--color-bg-account-add));
  }
  .bg-functionCall {
    background-color: rgb(var(--color-bg-function));
  }
  .bg-deleteAccount {
    background-color: rgb(var(--color-bg-account-delete));
  }
  .bg-deleteKey {
    background-color: rgb(var(--color-bg-key-delete));
  }
  .bg-deployContract {
    background-color: rgb(var(--color-bg-contract));
  }
  .bg-stake {
    background-color: rgb(var(--color-bg-stake));
  }
  .bg-transfer {
    background-color: rgb(var(--color-bg-transfer));
  }
`;
const Button = styled.button`
  height: 1.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  --tw-text-opacity: 1;
  color: rgb(0 0 0 / var(--tw-text-opacity));
  border-radius: 0.25rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  background-color: transparent;
  background-image: none;
  border: none;
`;
const Toggler = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.75rem;
`;

const Deposit = styled.span`
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1rem;
`;

const Args = styled.div`
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
`;

const Action = ({ action, open, setOpen }: ActionProps) => {
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

  return (
    <Container>
      <Button
        className={`${kind[action.kind].bg}`}
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
        <Toggler>{open ? '-' : '+'}</Toggler>
      </Button>
      <Deposit>
        {action.kind === 'transfer'
          ? `${formatNumber(yoctoToNear(action.args.deposit), 6)} Ⓝ`
          : null}
      </Deposit>
      {open && args && (
        <Args>
          <JsonView>{args}</JsonView>
        </Args>
      )}
    </Container>
  );
};

export default Action;
