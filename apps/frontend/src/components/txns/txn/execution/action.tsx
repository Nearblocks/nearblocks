'use client';

import { useContext, useMemo, useState } from 'react';

import type { ActionReceipt, TxnReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { useLocale } from '@/hooks/use-locale';
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
  onlyArgs?: boolean;
  receipt: TxnReceipt;
};

export const ReceiptAction = ({
  action,
  index,
  onlyArgs = false,
  receipt,
}: Props) => {
  const { t } = useLocale('txns');
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

  const isAurora = isAuroraAction(method, receipt.receiver_account_id);
  const rawArgs = findRawArgs(rpcData, receipt.receipt_id, index);
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

  const codeBlock =
    isAurora && argsBase64 ? (
      <AuroraArgsViewer argsBase64={argsBase64} method={method!} />
    ) : (
      displayCode && (
        <CodeViewer
          className="min-h-17"
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
                  {t('codeViewer.auto')}
                </Button>

                <Button
                  className="border-0"
                  onClick={onRawClick}
                  size="xs"
                  variant={viewMode === 'raw' ? 'secondary' : 'outline'}
                >
                  {t('codeViewer.raw')}
                </Button>
              </>
            )
          }
        />
      )
    );

  if (onlyArgs) {
    return <>{codeBlock}</>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <ReceiptIcon action={action.action} className="size-3.5" />
        <Action
          action={action}
          full={false}
          receiver={receipt.receiver_account_id}
          signer={receipt.predecessor_account_id}
        />
      </div>
      {codeBlock}
    </div>
  );
};
