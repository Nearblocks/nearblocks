'use client';

import type { JsonData } from 'nb-schemas/src/common';

import type { ActionReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { Copy } from '@/components/copy';
import { AccountLink, Link } from '@/components/link';
import { QuantumSafeBadge } from '@/components/quantum-safe-badge';
import { useLocale } from '@/hooks/use-locale';
import { NearCircle } from '@/icons/near-circle';
import { nearFormat } from '@/lib/format';
import { Badge } from '@/ui/badge';

type Props = {
  action: ActionReceipt;
  full?: boolean;
  hideCopy?: boolean;
  receiver: string;
  signer: string;
};

export const argsRecord = (args: JsonData): Record<string, JsonData> =>
  args !== null && typeof args === 'object' && !Array.isArray(args)
    ? (args as Record<string, JsonData>)
    : {};

export const Action = ({
  action,
  full = true,
  hideCopy = false,
  receiver,
  signer,
}: Props) => {
  const { t } = useLocale('txns');
  const args = argsRecord(action.args);

  if (action.action === ActionKind.FUNCTION_CALL) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {full ? (
          <>
            {t('actions.call')}{' '}
            <Badge variant="blue">
              <code>{action.method || 'method'}</code>
            </Badge>{' '}
            {t('actions.by')}{' '}
            <AccountLink
              account={signer}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />{' '}
            {t('actions.on')}{' '}
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
          </>
        ) : (
          <>
            {t('actions.calledMethod')}{' '}
            <Badge variant="blue">
              <code>{action.method || 'method'}</code>
            </Badge>{' '}
            {t('actions.inContract')}{' '}
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
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
            <AccountLink
              account={signer}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />{' '}
            {t('actions.to')}{' '}
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
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
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />{' '}
            {t('actions.by')}{' '}
            <AccountLink
              account={signer}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.DEPLOY_CONTRACT) {
    const codeHash =
      typeof args.code_hash === 'string' ? args.code_hash : undefined;
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {t('actions.deployContract')}
        {codeHash && (
          <>
            <Badge variant="gray">
              <code className="max-w-32 truncate sm:max-w-40">{codeHash}</code>
            </Badge>
            <Copy className="text-muted-foreground" text={codeHash} />
          </>
        )}
        {full && (
          <>
            {' '}
            {t('actions.to')}{' '}
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
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
    // The first three carry a code_hash; the fourth (USE_..._BY_ACCOUNT_ID)
    // carries an account_id instead — the guard naturally skips that case.
    const codeHash =
      typeof args.code_hash === 'string' ? args.code_hash : undefined;
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {t('actions.deployGlobalContract')}
        {codeHash && (
          <>
            <Badge variant="gray">
              <code className="max-w-32 truncate sm:max-w-40">{codeHash}</code>
            </Badge>
            <Copy className="text-muted-foreground" text={codeHash} />
          </>
        )}
        {full && (
          <>
            {' '}
            {t('actions.to')}{' '}
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
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
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
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
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
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
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
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
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.ADD_KEY) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {t('actions.addKey')}{' '}
        <QuantumSafeBadge publicKey={String(args.public_key ?? '')} />
        <Link
          className="text-link max-w-32 truncate sm:max-w-40"
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
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
          </>
        )}
      </span>
    );
  }

  if (action.action === ActionKind.DELETE_KEY) {
    return (
      <span className="text-body-sm flex flex-wrap items-center gap-1">
        {t('actions.deleteKey')}{' '}
        <QuantumSafeBadge publicKey={String(args.public_key ?? '')} />
        <Link
          className="text-link max-w-32 truncate sm:max-w-40"
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
            <AccountLink
              account={receiver}
              hideCopy={hideCopy}
              textClassName="max-w-32 sm:max-w-40"
            />
          </>
        )}
      </span>
    );
  }

  return (
    <span className="text-body-sm text-muted-foreground">{action.action}</span>
  );
};
