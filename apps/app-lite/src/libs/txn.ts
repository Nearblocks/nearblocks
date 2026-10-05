import Big from 'big.js';

import type {
  Action,
  ActionView,
  ExecutionOutcomeWithIdView,
  FailedToFindReceipt,
  FunctionCallActionView,
  NestedReceiptWithOutcome,
} from '@/types/near';

export const shortenString = (
  string: string,
  prefixLength = 6,
  suffixLength = 7,
  minLength = 15,
) => {
  const text = String(string);

  if (text.length <= minLength) return text;

  return `${text.slice(0, prefixLength)}...${text.slice(-suffixLength)}`;
};

export const depositAmount = (actions: ActionView[]) =>
  actions
    .map((action) => {
      if (typeof action === 'string') return '0';
      if ('FunctionCall' in action) return action.FunctionCall.deposit;
      if ('Transfer' in action) return action.Transfer.deposit;

      return '0';
    })
    .reduce((acc, deposit) => Big(acc).plus(deposit).toString(), '0');

export const txnFee = (
  receiptsOutcome: ExecutionOutcomeWithIdView[],
  txnTokensBurnt: string,
) =>
  receiptsOutcome
    .map((receipt) => receipt.outcome.tokens_burnt)
    .reduce((acc, fee) => Big(acc).add(fee).toString(), txnTokensBurnt);

export const gasLimit = (actions: Action[]) => {
  const gasAttached = actions
    .map((action) => action.args)
    .filter(
      (args): args is FunctionCallActionView['FunctionCall'] => 'gas' in args,
    );

  if (gasAttached.length === 0) return '0';

  return gasAttached.reduce(
    (acc, args) => Big(acc).add(args.gas).toString(),
    '0',
  );
};

export const refund = (
  receipts: (FailedToFindReceipt | NestedReceiptWithOutcome)[],
) =>
  receipts
    .filter(
      (nestedReceipt) =>
        'outcome' in nestedReceipt && nestedReceipt.predecessorId === 'system',
    )
    .reduce((acc, nestedReceipt) => {
      let gasDeposit = '0';

      if ('outcome' in nestedReceipt) {
        gasDeposit = nestedReceipt.actions
          .map((action) =>
            'deposit' in action.args ? action.args.deposit : '0',
          )
          .reduce((sum, deposit) => Big(sum).add(deposit).toString(), '0');
      }

      return Big(acc).add(gasDeposit).toString();
    }, '0');

export const prettify = (args: string) => {
  try {
    const bytes = Uint8Array.from(atob(args), (c) => c.charCodeAt(0));

    return JSON.stringify(
      JSON.parse(new TextDecoder().decode(bytes)),
      undefined,
      2,
    );
  } catch {
    return args;
  }
};

export const isAuroraAction = (method: string, receiver: string) =>
  receiver === 'aurora' &&
  (method === 'submit' ||
    method === 'submit_with_args' ||
    method === 'rlp_execute');

const MESSAGE_KEYS = ['msg', 'panic_msg'];

export type TxnState = 'failed' | 'pending' | 'success';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const getTxnState = (status: unknown): TxnState => {
  if (typeof status === 'string') return 'pending';
  if (isObject(status) && ('NotStarted' in status || 'Started' in status))
    return 'pending';
  if (isObject(status) && 'Failure' in status) return 'failed';

  return 'success';
};

export const isFailedStatus = (status: unknown) =>
  isObject(status) && 'Failure' in status;

export const getFailedReceipts = (
  receiptsOutcome: ExecutionOutcomeWithIdView[],
) =>
  receiptsOutcome.filter((receipt) => isFailedStatus(receipt.outcome.status))
    .length;

export const getErrorMessage = (status: unknown): string | undefined => {
  if (!isObject(status) || !('Failure' in status)) return undefined;

  const failure = status.Failure;

  if (typeof failure === 'string') return failure;
  if (!isObject(failure)) return undefined;

  const node = isObject(failure.ActionError)
    ? failure.ActionError.kind
    : 'InvalidTxError' in failure
      ? failure.InvalidTxError
      : failure;
  const top = typeof node === 'string' ? node : Object.keys(node ?? {})[0];
  let current: unknown = node;

  while (isObject(current)) {
    const [key] = Object.keys(current);

    if (!key) break;

    const next = current[key];

    if (typeof next === 'string')
      return key.endsWith('Error') || MESSAGE_KEYS.includes(key) ? next : top;

    current = next;
  }

  return typeof current === 'string' ? current : top;
};
