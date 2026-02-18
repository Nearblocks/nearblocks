'use client';

import { useContext, useMemo, useState } from 'react';

import type { ActionReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { Button } from '@/ui/button';

import { Action, argsRecord } from '../actions/action';
import { ReceiptIcon } from '../actions/icon';
import { AuroraArgsViewer } from './aurora';
import { CodeViewer } from './code';
import { RpcContext } from './context';
import { deepUnescape, findRawArgs, isAuroraAction } from './utils';

type Props = {
  action: ActionReceipt;
  index: number;
  receiptId: string;
  receiver: string;
  signer: string;
};

export const ReceiptAction = ({
  action,
  index,
  receiptId,
  receiver,
  signer,
}: Props) => {
  const { enableRpc, rpcData, rpcLoading } = useContext(RpcContext);
  const [viewMode, setViewMode] = useState<'auto' | 'raw'>('auto');

  const { args, argsBase64, hasArgs, method } = useMemo(() => {
    const args = argsRecord(action.args);
    let method: string | undefined = undefined;
    let hasArgs = Object.keys(args).length > 0;
    let argsJson, argsBase64;

    if (action.action === ActionKind.FUNCTION_CALL) {
      if (Object.keys(args).length > 0) {
        method =
          action.action === ActionKind.FUNCTION_CALL && 'method_name' in args
            ? (args.method_name as string)
            : undefined;
        argsBase64 = args.args_base64 as string;
        argsJson = argsRecord(args.args_json);
        hasArgs = Object.keys(argsJson).length > 0;
      }
    }

    return { args: argsJson ?? args, argsBase64, hasArgs, method };
  }, [action]);

  const isAurora = isAuroraAction(method, receiver);
  const rawArgs = findRawArgs(rpcData, receiptId, index);
  const autoCode = hasArgs
    ? JSON.stringify(deepUnescape(args), null, 2)
    : argsBase64;
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
      <div className="flex items-center gap-1">
        <ReceiptIcon action={action.action} className="size-3.5" />
        <Action
          action={action}
          full={false}
          receiver={receiver}
          signer={signer}
        />
      </div>
      {isAurora && argsBase64 ? (
        <AuroraArgsViewer argsBase64={argsBase64} method={method!} />
      ) : (
        displayCode && (
          <CodeViewer
            code={displayCode}
            toolbar={
              !!method && (
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
              )
            }
          />
        )
      )}
    </div>
  );
};
