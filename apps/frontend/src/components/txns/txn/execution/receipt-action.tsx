'use client';

import { useContext, useState } from 'react';

import type { ActionReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { useConfig } from '@/hooks/use-config';
import { Button } from '@/ui/button';

import { Action } from '../actions/action';
import { AuroraArgsViewer } from './aurora-args-viewer';
import { CodeViewer } from './code-viewer';
import { RpcContext } from './context';
import { deepUnescape, findRawArgs, isAuroraAction } from './utils';

type Props = {
  action: ActionReceipt;
  receiptId: string;
  receiver: string;
  signer: string;
};

export const ReceiptAction = ({
  action,
  receiptId,
  receiver,
  signer,
}: Props) => {
  const { enableRpc, rpcData, rpcLoading } = useContext(RpcContext);
  const [viewMode, setViewMode] = useState<'auto' | 'raw'>('auto');
  const networkId = useConfig((s) => s.config.networkId);

  const hasArgs =
    action.args != null &&
    typeof action.args === 'object' &&
    Object.keys(action.args as object).length > 0;

  const methodName =
    action.action === ActionKind.FUNCTION_CALL &&
    typeof action.args === 'object' &&
    action.args !== null &&
    'method_name' in (action.args as Record<string, unknown>)
      ? ((action.args as Record<string, unknown>).method_name as string)
      : undefined;

  const isAurora = isAuroraAction(methodName, receiver);
  const auroraExplorerUrl =
    networkId === 'mainnet'
      ? 'https://explorer.mainnet.aurora.dev'
      : 'https://explorer.testnet.aurora.dev';

  // For Aurora actions, args_base64 is available directly from the API
  const argsBase64 = isAurora
    ? ((action.args as Record<string, unknown>)?.args_base64 as
        | null
        | string) ?? null
    : null;

  const rawArgs = findRawArgs(rpcData, receiptId, methodName);

  const autoCode = hasArgs
    ? JSON.stringify(deepUnescape(action.args), null, 2)
    : '';
  const rawCode = rawArgs ?? (rpcLoading ? 'Loading...' : 'No data');
  const displayCode = viewMode === 'raw' ? rawCode : autoCode;

  const onRawClick = () => {
    setViewMode('raw');
    if (!rpcData) {
      enableRpc();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Action action={action} receiver={receiver} signer={signer} />
      {isAurora && argsBase64 ? (
        <AuroraArgsViewer
          auroraExplorerUrl={auroraExplorerUrl}
          methodName={methodName!}
          rawArgsBase64={argsBase64}
          rlpHash={action.rlp_hash}
        />
      ) : (
        hasArgs && (
          <CodeViewer
            code={displayCode}
            toolbar={
              <>
                <Button
                  className="border-0"
                  onClick={() => setViewMode('auto')}
                  size="xs"
                  variant={viewMode === 'auto' ? 'secondary' : 'outline'}
                >
                  Auto
                </Button>
                <Button
                  className="border-0"
                  onClick={onRawClick}
                  size="xs"
                  variant={viewMode === 'raw' ? 'secondary' : 'outline'}
                >
                  Raw
                </Button>
              </>
            }
          />
        )
      )}
    </div>
  );
};
