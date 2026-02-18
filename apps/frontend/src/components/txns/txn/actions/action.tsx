import type { JsonData } from 'nb-schemas/src/common';

import type { ActionReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { Copy } from '@/components/copy';
import { AccountLink, Link } from '@/components/link';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat } from '@/lib/format';
import { Badge } from '@/ui/badge';

type Props = {
  action: ActionReceipt;
  full?: boolean;
  receiver: string;
  signer: string;
};

export const argsRecord = (args: JsonData): Record<string, JsonData> =>
  args !== null && typeof args === 'object' && !Array.isArray(args)
    ? (args as Record<string, JsonData>)
    : {};

export const Action = ({ action, full = true, receiver, signer }: Props) => {
  const args = argsRecord(action.args);

  if (action.action === ActionKind.FUNCTION_CALL) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        Call <Badge variant="blue">{action.method || 'method'}</Badge>
        {full && (
          <>
            {' '}
            By <AccountLink account={signer} textClassName="max-w-40" /> On{' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.TRANSFER) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        Transfer <NearCircle className="size-4" />
        {nearFormat(String(args.deposit ?? 0))}
        {full && (
          <>
            {' '}
            From <AccountLink
              account={receiver}
              textClassName="max-w-40"
            /> To <AccountLink account={signer} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.STAKE) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        Stake <NearCircle className="size-4" />
        {nearFormat(String(args.stake ?? 0))}
        {full && (
          <>
            {' '}
            To <AccountLink
              account={receiver}
              textClassName="max-w-40"
            /> By <AccountLink account={signer} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.DEPLOY_CONTRACT) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        Deploy Contract
        {full && (
          <>
            {' '}
            To <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (
    action.action === ActionKind.DEPLOY_GLOBAL_CONTRACT ||
    action.action === ActionKind.DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID ||
    action.action === ActionKind.USE_GLOBAL_CONTRACT ||
    action.action === ActionKind.USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID
  ) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        Deploy Global Contract
        {full && (
          <>
            {' '}
            To <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.CREATE_ACCOUNT) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        Create Account
        {full && (
          <>
            {' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.DETERMINISTIC_STATE_INIT) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        Create Deterministic Account
        {full && (
          <>
            {' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.DELETE_ACCOUNT) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        Delete Account
        {full && (
          <>
            {' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.DELEGATE_ACTION) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        Delegate
        {full && (
          <>
            {' '}
            For <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.ADD_KEY) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        New Key{' '}
        <Link
          className="text-link max-w-40 truncate"
          href={`/address/${receiver}/keys`}
        >
          {String(args.public_key ?? '')}
        </Link>
        <Copy
          className="text-muted-foreground"
          text={String(args.public_key ?? '')}
        />
        {full && (
          <>
            {' '}
            For <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.DELETE_KEY) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        Delete Key{' '}
        <Link
          className="text-link max-w-40 truncate"
          href={`/address/${receiver}/keys`}
        >
          {String(args.public_key ?? '')}
        </Link>
        <Copy
          className="text-muted-foreground"
          text={String(args.public_key ?? '')}
        />
        {full && (
          <>
            {' '}
            From <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  return (
    <span className="text-body-sm text-muted-foreground">{action.action}</span>
  );
};
