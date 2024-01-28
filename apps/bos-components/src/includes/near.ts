import { dollarFormat, localFormat } from '@/includes/formats';
import { yoctoToNear } from '@/includes/libs';
import {
  ActionType,
  Obj,
  TransactionLog,
  RPCTransactionInfo,
} from '@/includes/types';

export function encodeArgs(args: object) {
  if (!args || typeof args === 'undefined') return '';

  return Buffer.from(JSON.stringify(args)).toString('base64');
}

export function decodeArgs(args: number[]) {
  if (!args || typeof args === 'undefined') return {};

  const encodedString = Buffer.from(args).toString('base64');
  return JSON.parse(Buffer.from(encodedString, 'base64').toString());
}

export function txnMethod(
  actions: { action: string; method: string }[],
  t?: (key: string, options?: { count?: string | undefined }) => string,
) {
  const count = actions?.length || 0;

  if (!count) return t ? t('txns:unknownType') : 'Unknown';
  if (count > 1) return t ? t('txns:batchTxns') : 'Batch Transaction';

  const action = actions[0];

  if (action.action === 'FUNCTION_CALL') {
    return action.method;
  }

  return action.action;
}

export function gasPrice(yacto: number) {
  const near = Big(yoctoToNear(yacto, false)).mul(Big(10).pow(12)).toString();

  return `${localFormat(near)} Ⓝ / Tgas`;
}

export function tokenAmount(amount: string, decimal: string, format: boolean) {
  if (amount === undefined || amount === null) return 'N/A';
  const near = Big(amount).div(Big(10).pow(decimal));
  const formattedValue = format
    ? near.toFixed(8).replace(/\.?0+$/, '')
    : near.toFixed(decimal).replace(/\.?0+$/, '');
  return formattedValue;
}

export function tokenPercentage(
  supply: number,
  amount: string,
  decimal: string,
) {
  const nearAmount = Big(amount).div(Big(10).pow(decimal));
  const nearSupply = Big(supply);

  return nearAmount.div(nearSupply).mul(Big(100)).toFixed(2);
}
export function price(amount: string, decimal: string, price: number) {
  const nearAmount = Big(amount).div(Big(10).pow(decimal));
  return dollarFormat(nearAmount.mul(Big(price || 0)).toString());
}
export function mapRpcActionToAction(action: string | ActionType) {
  if (action === 'CreateAccount') {
    return {
      action_kind: 'CreateAccount',
      args: {},
    };
  }

  if (typeof action === 'object') {
    const kind = Object.keys(action)[0];

    return {
      action_kind: kind,
      args: action[kind],
    };
  }

  return null;
}

function valueFromObj(obj: Obj): string | undefined {
  const keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const nestedValue = valueFromObj(value as Obj);
      if (nestedValue) {
        return nestedValue;
      }
    }
  }

  return undefined;
}

export function txnLogs(txn: RPCTransactionInfo): TransactionLog[] {
  let txLogs: TransactionLog[] = [];

  const outcomes = txn?.receipts_outcome || [];

  for (let i = 0; i < outcomes.length; i++) {
    const outcome = outcomes[i];
    let logs = outcome?.outcome?.logs || [];

    if (logs.length > 0) {
      const mappedLogs: TransactionLog[] = logs.map((log: string) => ({
        contract: outcome?.outcome?.executor_id || '',
        logs: log,
      }));
      txLogs = [...txLogs, ...mappedLogs];
    }
  }

  return txLogs;
}

export function txnActions(txn: RPCTransactionInfo) {
  const txActions = [];
  const receipts = txn?.receipts || [];

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    const from = receipt?.predecessor_id;
    const to = receipt?.receiver_id;

    if (Array.isArray(receipt?.receipt)) {
      const actions = receipt.receipt;

      for (let j = 0; j < actions.length; j++) {
        const action = actions[j];

        txActions.push({ from, to, ...action });
      }
    } else {
      const actions = receipt?.receipt?.Action?.actions || [];

      for (let j = 0; j < actions.length; j++) {
        const action = mapRpcActionToAction(actions[j]);

        txActions.push({ from, to, ...action });
      }
    }
  }

  return txActions.filter(
    (action) =>
      action.action_kind !== 'FunctionCall' && action.from !== 'system',
  );
}

export function txnErrorMessage(txn: RPCTransactionInfo) {
  const kind = txn?.status?.Failure?.ActionError?.kind;

  if (typeof kind === 'string') return kind;
  if (typeof kind === 'object') {
    return valueFromObj(kind);
  }

  return null;
}

export function formatLine(line: any, offset: any, format: any) {
  let result = `${offset.toString(16).padStart(8, '0')}  `;

  const bytes = line.split(' ').filter(Boolean);
  bytes.forEach((byte: any, index: any) => {
    if (index > 0 && index % 4 === 0) {
      result += ' ';
    }
    result += byte.toUpperCase().padEnd(2, ' ') + ' ';
  });

  if (format === 'default') {
    result += ` ${String.fromCharCode(
      ...bytes.map((b: any) => parseInt(b, 16)),
    )}`;
  }

  return result.trimEnd();
}
