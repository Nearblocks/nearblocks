'use client';

import type { JsonData } from 'nb-schemas/src/common';

import type { ActionReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { Copy } from '@/components/copy';
import { AccountLink, Link } from '@/components/link';
import { useLocale } from '@/hooks/use-locale';
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
  const { t } = useLocale('txns');
  const args = argsRecord(action.args);

  if (action.action === ActionKind.FUNCTION_CALL) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {full ? (
          <>
            {t('actions.call')}{' '}
            <Badge variant="blue">{action.method || 'method'}</Badge>{' '}
            {t('actions.by')}{' '}
            <AccountLink account={signer} textClassName="max-w-40" />{' '}
            {t('actions.on')}{' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        ) : (
          <>
            {t('actions.calledMethod')}{' '}
            <Badge variant="blue">{action.method || 'method'}</Badge>{' '}
            {t('actions.inContract')}{' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.TRANSFER) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {t('actions.transfer')} <NearCircle className="size-4" />
        {nearFormat(String(args.deposit ?? 0))}
        {full && (
          <>
            {' '}
            {t('actions.from')}{' '}
            <AccountLink account={signer} textClassName="max-w-40" />{' '}
            {t('actions.to')}{' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.STAKE) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {t('actions.stake')} <NearCircle className="size-4" />
        {nearFormat(String(args.stake ?? 0))}
        {full && (
          <>
            {' '}
            {t('actions.to')}{' '}
            <AccountLink account={receiver} textClassName="max-w-40" />{' '}
            {t('actions.by')}{' '}
            <AccountLink account={signer} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.DEPLOY_CONTRACT) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {t('actions.deployContract')}
        {full && (
          <>
            {' '}
            {t('actions.to')}{' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
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
        {t('actions.deployGlobalContract')}
        {full && (
          <>
            {' '}
            {t('actions.to')}{' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.CREATE_ACCOUNT) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {t('actions.createAccount')}
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
        {t('actions.createDeterministicAccount')}
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
        {t('actions.deleteAccount')}
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
        {t('actions.delegate')}
        {full && (
          <>
            {' '}
            {t('actions.for')}{' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.ADD_KEY) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {t('actions.addKey')}{' '}
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
            {t('actions.for')}{' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.DELETE_KEY) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {t('actions.deleteKey')}{' '}
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
            {t('actions.from')}{' '}
            <AccountLink account={receiver} textClassName="max-w-40" />
          </>
        )}
      </span>
    );
  }

  return (
    <span className="text-body-sm text-muted-foreground">{action.action}</span>
  );
};
