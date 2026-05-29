'use client';

import type { JsonData } from 'nb-schemas/src/common';
import { useContext, useMemo } from 'react';

import type { ActionReceipt, TxnReceipt } from 'nb-schemas';
import { ActionKind } from 'nb-types';

import { Action, argsRecord } from '../actions/action';
import { ReceiptIcon } from '../actions/icon';
import { AuroraArgsViewer } from './aurora';
import { CodeViewer } from './code';
import { RpcContext } from './context';
import { hasJsonValue } from './encode';
import { EncodedData } from './encoded-data';
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
  const { enableRpc, rpcData, rpcLoading } = useContext(RpcContext);

  const { argsBase64, argsValue, hasArgs, method } = useMemo(() => {
    const wrapper = argsRecord(action.args);
    let method: string | undefined =
      typeof action.method === 'string' ? action.method : undefined;
    // For function calls the indexer wraps args as { args_json, args_base64,
    // method_name, ... }. `args_json` may be any JSON value — including a
    // top-level array — so it must not be coerced to a record. For every other
    // action kind the raw args object is shown as-is.
    let argsValue: JsonData | undefined;
    let argsBase64: string | undefined;

    if (action.action === ActionKind.FUNCTION_CALL) {
      if (!method && typeof wrapper.method_name === 'string') {
        method = wrapper.method_name;
      }
      argsBase64 =
        typeof wrapper.args_base64 === 'string'
          ? wrapper.args_base64
          : undefined;
      argsValue = wrapper.args_json ?? undefined;
    } else {
      argsValue = action.args ?? undefined;
    }

    return { argsBase64, argsValue, hasArgs: hasJsonValue(argsValue), method };
  }, [action]);

  const isAurora = isAuroraAction(method, receipt.receiver_account_id);
  const showEncodingToggle = !!method && (!!argsBase64 || hasArgs);
  const rawArgs = findRawArgs(rpcData, receipt.receipt_id, index);
  const rawCode = rawArgs ?? (rpcLoading ? 'Loading...' : 'No data');

  const codeBlock =
    isAurora && argsBase64 ? (
      <AuroraArgsViewer argsBase64={argsBase64} method={method!} />
    ) : showEncodingToggle ? (
      <EncodedData
        base64={argsBase64}
        className="min-h-17"
        json={argsValue}
        onRawSelect={() => {
          if (!rpcData) enableRpc();
        }}
        rawCode={rawCode}
      />
    ) : hasArgs ? (
      <CodeViewer
        className="min-h-17"
        code={JSON.stringify(deepUnescape(argsValue), null, 2)}
        showByteSize
        tree
      />
    ) : argsBase64 ? (
      <CodeViewer className="min-h-17" code={argsBase64} showByteSize />
    ) : null;

  if (onlyArgs) {
    return <>{codeBlock}</>;
  }

  return (
    <div className="flex w-full flex-col gap-1">
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
